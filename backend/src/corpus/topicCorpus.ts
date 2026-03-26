import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RawRedditUnit } from '../types/internal.js';
import { toRedditUrl } from '../pipeline/units/buildExperienceUnits.js';
import { THRESHOLDS } from '../config/thresholds.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CORPUS_DIR = join(__dirname, '../../data/corpus');

export type CorpusRetrievalMode = 'live' | 'replay' | 'cache';

export interface CorpusProvenance {
  source_subreddit: string;
  source_url: string;
  /** First time this unit entered the corpus. */
  retrieval_mode: CorpusRetrievalMode;
  first_seen_at: string;
  last_seen_at: string;
  /** Mode of the most recent ingest that touched this row. */
  last_ingest_mode: CorpusRetrievalMode;
}

export interface CorpusEntry {
  raw: RawRedditUnit;
  provenance: CorpusProvenance;
}

export interface TopicCorpusFile {
  version: 1;
  slug: string;
  updated_at: string;
  entries: CorpusEntry[];
}

export function topicCorpusPath(slug: string): string {
  return join(CORPUS_DIR, `${slug.trim().toLowerCase()}.json`);
}

export async function loadTopicCorpus(slug: string): Promise<TopicCorpusFile | null> {
  try {
    const raw = await readFile(topicCorpusPath(slug), 'utf-8');
    const parsed = JSON.parse(raw) as TopicCorpusFile;
    if (!parsed.entries || !Array.isArray(parsed.entries)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function saveTopicCorpus(corpus: TopicCorpusFile): Promise<void> {
  await mkdir(CORPUS_DIR, { recursive: true });
  await writeFile(topicCorpusPath(corpus.slug), JSON.stringify(corpus, null, 2), 'utf-8');
}

export function normalizePermalinkKey(permalink: string): string {
  const p = permalink.trim();
  const withoutHost = p.replace(/^https?:\/\/(www\.)?reddit\.com/i, '');
  return withoutHost.split('?')[0].toLowerCase();
}

export function stableRawKey(raw: RawRedditUnit): string {
  if (raw.name?.trim()) return raw.name.trim();
  return `url:${normalizePermalinkKey(raw.permalink)}`;
}

function longerRawWins(a: RawRedditUnit, b: RawRedditUnit): RawRedditUnit {
  const la = (a.title ?? '').length + a.body.length;
  const lb = (b.title ?? '').length + b.body.length;
  return lb > la ? b : a;
}

function tokens(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  let inter = 0;
  for (const x of a) {
    if (b.has(x)) inter++;
  }
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

/** Near-duplicate excerpt/title-body collapse; merges provenance. */
export function dedupeCorpusEntriesByTextSimilarity(
  entries: CorpusEntry[],
  jaccardThreshold: number = THRESHOLDS.dedupJaccard
): CorpusEntry[] {
  const kept: CorpusEntry[] = [];
  const nowIso = new Date().toISOString();
  for (const e of entries) {
    let dupIdx = -1;
    for (let i = 0; i < kept.length; i++) {
      const k = kept[i]!;
      if (e.raw.name && e.raw.name === k.raw.name) {
        dupIdx = i;
        break;
      }
      const pk = normalizePermalinkKey(e.raw.permalink);
      if (pk.length > 1 && pk === normalizePermalinkKey(k.raw.permalink)) {
        dupIdx = i;
        break;
      }
      const et = `${e.raw.title ?? ''}\n${e.raw.body}`;
      const kt = `${k.raw.title ?? ''}\n${k.raw.body}`;
      if (jaccard(tokens(et), tokens(kt)) >= jaccardThreshold) {
        dupIdx = i;
        break;
      }
    }
    if (dupIdx === -1) {
      kept.push(e);
      continue;
    }
    const k = kept[dupIdx]!;
    const mergedRaw = longerRawWins(k.raw, e.raw);
    const mergedProv = mergeProvenance(k.provenance, e.provenance, nowIso);
    kept[dupIdx] = { raw: mergedRaw, provenance: mergedProv };
  }
  return kept;
}

function mergeProvenance(a: CorpusProvenance, b: CorpusProvenance, now: string): CorpusProvenance {
  const ta = new Date(a.first_seen_at).getTime();
  const tb = new Date(b.first_seen_at).getTime();
  const first = ta <= tb ? a : b;
  const second = ta <= tb ? b : a;
  const lastSeen = new Date(
    Math.max(
      new Date(first.last_seen_at).getTime(),
      new Date(second.last_seen_at).getTime(),
      new Date(now).getTime()
    )
  ).toISOString();
  const lastIngest =
    new Date(second.last_seen_at).getTime() >= new Date(first.last_seen_at).getTime()
      ? second.last_ingest_mode
      : first.last_ingest_mode;
  return {
    source_subreddit: first.source_subreddit,
    source_url: first.source_url,
    retrieval_mode: first.retrieval_mode,
    first_seen_at: first.first_seen_at,
    last_seen_at: lastSeen,
    last_ingest_mode: lastIngest,
  };
}

export interface MergeCorpusStats {
  previous_stored_entry_count: number;
  newly_ingested_raw_count: number;
  entries_after_upsert: number;
  entries_after_text_dedupe: number;
  entries_after_trim: number;
}

export function mergeAndUpsertCorpus(
  existing: CorpusEntry[],
  incoming: Array<{ raw: RawRedditUnit; mode: CorpusRetrievalMode }>,
  nowIso: string
): { entries: CorpusEntry[]; stats: Pick<MergeCorpusStats, 'previous_stored_entry_count' | 'newly_ingested_raw_count' | 'entries_after_upsert'> } {
  const byKey = new Map<string, CorpusEntry>();
  for (const e of existing) {
    byKey.set(stableRawKey(e.raw), e);
  }

  for (const { raw, mode } of incoming) {
    const key = stableRawKey(raw);
    const url = toRedditUrl(raw.permalink);
    const next: CorpusEntry = {
      raw,
      provenance: {
        source_subreddit: raw.subreddit,
        source_url: url,
        retrieval_mode: mode,
        first_seen_at: nowIso,
        last_seen_at: nowIso,
        last_ingest_mode: mode,
      },
    };

    const prev = byKey.get(key);
    if (!prev) {
      byKey.set(key, next);
      continue;
    }

    const mergedRaw = longerRawWins(prev.raw, raw);
    const mergedProv = mergeProvenance(prev.provenance, next.provenance, nowIso);
    mergedProv.last_ingest_mode = mode;
    mergedProv.last_seen_at = nowIso;
    byKey.set(key, { raw: mergedRaw, provenance: mergedProv });
  }

  const entries = [...byKey.values()];
  return {
    entries,
    stats: {
      previous_stored_entry_count: existing.length,
      newly_ingested_raw_count: incoming.length,
      entries_after_upsert: entries.length,
    },
  };
}

export function finalizeCorpusEntries(
  entries: CorpusEntry[],
  baseStats: Pick<
    MergeCorpusStats,
    'previous_stored_entry_count' | 'newly_ingested_raw_count' | 'entries_after_upsert'
  >,
  jaccardThreshold: number,
  maxEntries: number
): { entries: CorpusEntry[]; stats: MergeCorpusStats } {
  let next = dedupeCorpusEntriesByTextSimilarity(entries, jaccardThreshold);
  const afterDedupe = next.length;
  next = trimCorpusToMax(next, maxEntries);
  return {
    entries: next,
    stats: {
      ...baseStats,
      entries_after_text_dedupe: afterDedupe,
      entries_after_trim: next.length,
    },
  };
}

/** Keep newest posts by `created_utc` when over capacity. */
export function trimCorpusToMax(entries: CorpusEntry[], maxEntries: number): CorpusEntry[] {
  if (entries.length <= maxEntries) return entries;
  const sorted = [...entries].sort((a, b) => b.raw.created_utc - a.raw.created_utc);
  return sorted.slice(0, maxEntries);
}
