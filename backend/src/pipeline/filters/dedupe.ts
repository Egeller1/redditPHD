import type { RawRedditUnit } from '../../types/internal.js';
import { THRESHOLDS } from '../../config/thresholds.js';
import { normalizePermalinkKey } from '../../corpus/topicCorpus.js';

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

function dedupeBySimilarityWithThreshold(
  units: RawRedditUnit[],
  jaccardMin: number
): RawRedditUnit[] {
  const kept: RawRedditUnit[] = [];
  for (const u of units) {
    const text = `${u.title ?? ''}\n${u.body}`;
    const tset = tokens(text);
    let dup = false;
    for (const k of kept) {
      const kt = `${k.title ?? ''}\n${k.body}`;
      if (jaccard(tset, tokens(kt)) >= jaccardMin) {
        dup = true;
        break;
      }
    }
    if (!dup) kept.push(u);
  }
  return kept;
}

export function dedupeBySimilarity(
  units: RawRedditUnit[],
  jaccardMin: number = THRESHOLDS.dedupJaccard
): RawRedditUnit[] {
  return dedupeBySimilarityWithThreshold(units, jaccardMin);
}

/** Stable Reddit id (`name`) then permalink path (cross-run). */
export function dedupeRawByExactIdentity(units: RawRedditUnit[]): RawRedditUnit[] {
  const byName = new Map<string, RawRedditUnit>();
  const byPath = new Map<string, RawRedditUnit>();
  for (const u of units) {
    if (u.name?.trim()) {
      const prev = byName.get(u.name);
      if (!prev) {
        byName.set(u.name, u);
        continue;
      }
      const w = textWeight(u) > textWeight(prev) ? u : prev;
      byName.set(u.name, w);
      continue;
    }
    const path = normalizePermalinkKey(u.permalink);
    const prev = byPath.get(path);
    if (!prev) {
      byPath.set(path, u);
      continue;
    }
    byPath.set(path, textWeight(u) > textWeight(prev) ? u : prev);
  }
  const out: RawRedditUnit[] = [];
  const seenPath = new Set<string>();
  for (const u of byName.values()) {
    out.push(u);
    seenPath.add(normalizePermalinkKey(u.permalink));
  }
  for (const u of byPath.values()) {
    const path = normalizePermalinkKey(u.permalink);
    if (seenPath.has(path)) continue;
    seenPath.add(path);
    out.push(u);
  }
  return out;
}

function textWeight(u: RawRedditUnit): number {
  return (u.title ?? '').length + u.body.length;
}

/** Exact id/url dedupe, then near-duplicate text (pipeline pass). */
export function dedupeRawUnitsFull(
  units: RawRedditUnit[],
  jaccardMin: number = THRESHOLDS.dedupJaccard
): RawRedditUnit[] {
  const exact = dedupeRawByExactIdentity(units);
  return dedupeBySimilarityWithThreshold(exact, jaccardMin);
}
