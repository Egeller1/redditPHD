import type { TopicBundle, PersonalizeRequest, PersonalizeResponse } from '../types/topicBundle.js';
import type { CorpusProvenance, CorpusEntry, MergeCorpusStats } from '../corpus/topicCorpus.js';
import type { CorpusRetrievalMode } from '../corpus/topicCorpus.js';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expandQueryVariants, slugToDisplayName } from '../pipeline/query/resolveTopic.js';
import { filterRawUnits } from '../pipeline/filters/filterUnits.js';
import { dedupeRawUnitsFull } from '../pipeline/filters/dedupe.js';
import { buildExperienceUnits } from '../pipeline/units/buildExperienceUnits.js';
import { printTaxonomyDiagnostics } from '../pipeline/extraction/taxonomyDiagnostics.js';
import { HeuristicScorer } from '../pipeline/scoring/heuristicScorer.js';
import { buildTopicBundle } from '../pipeline/bundle/buildTopicBundle.js';
import { buildDataQuality } from '../pipeline/bundle/dataQuality.js';
import { loadReplayFixture } from '../pipeline/reddit/replayLoader.js';
import { retrieveLiveCandidatesDetailed, type LiveSearchDiagnostics } from '../pipeline/reddit/liveSearch.js';
import {
  loadTopicCorpus,
  saveTopicCorpus,
  mergeAndUpsertCorpus,
  finalizeCorpusEntries,
  stableRawKey,
} from '../corpus/topicCorpus.js';
import { SAMPLING, samplingDiagnosticsEnabled, isCorpusDisabled } from '../config/sampling.js';
import { THRESHOLDS } from '../config/thresholds.js';
import type { DataQuality } from '../types/topicBundle.js';
import type { ExperienceUnit, RawRedditUnit, TopicPipelineContext } from '../types/internal.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, '../fixtures');

export type RedditMode = 'live' | 'replay' | 'fixture' | 'cache';

export interface TopicResolutionDiagnostics {
  normalized_slug: string;
  query_variants: string[];
  subreddits_searched: string[];
  replay_available: boolean;
  corpus_available: boolean;
  live_attempted: boolean;
  candidate_posts_found: number;
  threads_fetched: number;
  threads_expanded: boolean;
  usable_units_extracted: number;
  would_return_bundle: boolean;
  reason: string;
  retrieval_mode: DataQuality['retrieval_mode'] | null;
  live_requests_attempted: number;
  live_requests_succeeded: number;
  live_requests_failed: number;
}

function mode(): RedditMode {
  const m = (process.env.REDDIT_MODE || 'replay').toLowerCase();
  if (m === 'live' || m === 'replay' || m === 'fixture' || m === 'cache') return m;
  return 'replay';
}

function boolEnvDefaultTrue(name: string): boolean {
  const v = process.env[name]?.trim().toLowerCase();
  if (!v) return true;
  return v === '1' || v === 'true' || v === 'yes';
}

function intEnv(name: string, defaultValue: number): number {
  const raw = process.env[name];
  if (!raw) return defaultValue;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : defaultValue;
}

const MIN_LIVE_USABLE_UNITS = Math.max(1, intEnv('MIN_LIVE_USABLE_UNITS', 1));

function shouldAttemptLiveFallback(currentMode: RedditMode): boolean {
  if (currentMode === 'live') return true;
  return boolEnvDefaultTrue('LIVE_FALLBACK_ON_MISS');
}

async function loadBundleFixture(slug: string): Promise<TopicBundle | null> {
  try {
    const raw = await readFile(join(FIXTURES, `${slug}.bundle.json`), 'utf-8');
    return JSON.parse(raw) as TopicBundle;
  } catch {
    return null;
  }
}

function provenanceMapFromEntries(entries: CorpusEntry[]): Map<string, CorpusProvenance> {
  const m = new Map<string, CorpusProvenance>();
  for (const e of entries) {
    m.set(e.raw.name, e.provenance);
  }
  return m;
}

function countModesAmongExperience(
  units: ExperienceUnit[],
  byName: Map<string, CorpusProvenance>
): { live: number; replay: number; cache: number } {
  const o = { live: 0, replay: 0, cache: 0 };
  for (const u of units) {
    const p = byName.get(u.raw.name);
    if (!p) continue;
    if (p.retrieval_mode === 'live') o.live++;
    else if (p.retrieval_mode === 'replay') o.replay++;
    else o.cache++;
  }
  return o;
}

function printCorpusDiagnostics(args: {
  slug: string;
  merge: MergeCorpusStats;
  pre_filter_corpus_raw: number;
  post_filter_raw: number;
  post_pipeline_dedupe_raw: number;
  analyzed_unit_count: number;
  analyzed_thread_count: number;
  subreddit_count: number;
  units_by_provenance_first_seen: { live: number; replay: number; cache: number };
  consensus_confidence: number;
  sample_strength: DataQuality['sample_strength'];
  low_data_warning: string | null;
  touched_this_run: number;
}) {
  console.info(
    '[corpus-diagnostics]',
    JSON.stringify(
      {
        ...args,
        target_analyzed_units: SAMPLING.targetAnalyzedUnitCount,
        max_usable_units_per_run: SAMPLING.maxUsableUnitsPerRun,
      },
      null,
      2
    )
  );
}

function buildTopicPipelineContext(slug: string, displayName: string): TopicPipelineContext {
  return {
    slug: slug.trim().toLowerCase(),
    displayName,
    queryVariants: expandQueryVariants(slug),
  };
}

function estimatedUsableUnits(raw: RawRedditUnit[]): number {
  let units = filterRawUnits(raw);
  units = dedupeRawUnitsFull(units);
  units.sort((a, b) => b.created_utc - a.created_utc);
  units = units.slice(0, SAMPLING.maxUsableUnitsPerRun);
  return units.length;
}

function emptyDiag(normalized: string): TopicResolutionDiagnostics {
  return {
    normalized_slug: normalized,
    query_variants: expandQueryVariants(normalized),
    subreddits_searched: [],
    replay_available: false,
    corpus_available: false,
    live_attempted: false,
    candidate_posts_found: 0,
    threads_fetched: 0,
    threads_expanded: false,
    usable_units_extracted: 0,
    would_return_bundle: false,
    reason: 'not resolved',
    retrieval_mode: null,
    live_requests_attempted: 0,
    live_requests_succeeded: 0,
    live_requests_failed: 0,
  };
}

export function runPipelineFromRaw(
  slug: string,
  displayName: string,
  raw: RawRedditUnit[],
  retrievalMode: DataQuality['retrieval_mode'],
  diag?: {
    merge: MergeCorpusStats;
    provenanceByName: Map<string, CorpusProvenance>;
    touchedKeys: Set<string>;
  }
): TopicBundle {
  const scorer = new HeuristicScorer();
  const preFilter = raw.length;
  let units = filterRawUnits(raw);
  const postFilter = units.length;
  units = dedupeRawUnitsFull(units);
  const postDedupe = units.length;
  units.sort((a, b) => b.created_utc - a.created_utc);
  units = units.slice(0, SAMPLING.maxUsableUnitsPerRun);
  const topicPipelineCtx = buildTopicPipelineContext(slug, displayName);
  const experience = buildExperienceUnits(units, scorer, topicPipelineCtx);
  const bundle = buildTopicBundle(slug, displayName, experience, { retrievalMode });

  if (process.env.TOPIC_TAXONOMY_DIAGNOSTICS === '1' || process.env.TOPIC_TAXONOMY_DIAGNOSTICS === 'true') {
    printTaxonomyDiagnostics(experience, topicPipelineCtx);
  }

  if (diag && samplingDiagnosticsEnabled(slug)) {
    const modes = countModesAmongExperience(experience, diag.provenanceByName);
    printCorpusDiagnostics({
      slug,
      merge: diag.merge,
      pre_filter_corpus_raw: preFilter,
      post_filter_raw: postFilter,
      post_pipeline_dedupe_raw: postDedupe,
      analyzed_unit_count: bundle.topic.analyzed_unit_count,
      analyzed_thread_count: bundle.topic.analyzed_thread_count,
      subreddit_count: bundle.topic.subreddit_count,
      units_by_provenance_first_seen: modes,
      consensus_confidence: bundle.consensus.confidence,
      sample_strength: bundle.data_quality.sample_strength,
      low_data_warning: bundle.low_data_warning,
      touched_this_run: diag.touchedKeys.size,
    });
  }

  return bundle;
}

async function buildFromCorpusMerge(
  slug: string,
  displayName: string,
  incoming: Array<{ raw: RawRedditUnit; mode: CorpusRetrievalMode }>,
  apiMode: DataQuality['retrieval_mode']
): Promise<TopicBundle> {
  const now = new Date().toISOString();
  const stored = await loadTopicCorpus(slug);
  const existing = stored?.entries ?? [];

  const touchedKeys = new Set(incoming.map((i) => stableRawKey(i.raw)));
  const { entries: upserted, stats: baseStats } = mergeAndUpsertCorpus(existing, incoming, now);
  const { entries: finalEntries, stats: mergeStats } = finalizeCorpusEntries(
    upserted,
    baseStats,
    THRESHOLDS.dedupJaccard,
    SAMPLING.maxCorpusEntries
  );

  await saveTopicCorpus({
    version: 1,
    slug,
    updated_at: now,
    entries: finalEntries,
  });

  const rawList = finalEntries.map((e) => e.raw);
  const prov = provenanceMapFromEntries(finalEntries);
  return runPipelineFromRaw(slug, displayName, rawList, apiMode, {
    merge: mergeStats,
    provenanceByName: prov,
    touchedKeys,
  });
}

function buildFromStoredCorpusOnly(
  slug: string,
  displayName: string,
  entries: CorpusEntry[]
): TopicBundle {
  const rawList = entries.map((e) => e.raw);
  const prov = provenanceMapFromEntries(entries);
  const mergeStats: MergeCorpusStats = {
    previous_stored_entry_count: entries.length,
    newly_ingested_raw_count: 0,
    entries_after_upsert: entries.length,
    entries_after_text_dedupe: entries.length,
    entries_after_trim: entries.length,
  };
  return runPipelineFromRaw(slug, displayName, rawList, 'cache', {
    merge: mergeStats,
    provenanceByName: prov,
    touchedKeys: new Set(),
  });
}

async function attemptLiveResolution(
  normalized: string,
  displayName: string,
  diag: TopicResolutionDiagnostics
): Promise<{ bundle: TopicBundle | null; diag: TopicResolutionDiagnostics }> {
  const variants = diag.query_variants;
  diag.live_attempted = true;
  let liveRaw: RawRedditUnit[] = [];
  let liveDiag: LiveSearchDiagnostics | null = null;
  try {
    const live = await retrieveLiveCandidatesDetailed(variants);
    liveRaw = live.candidates;
    liveDiag = live.diagnostics;
  } catch (e) {
    console.warn('[topicService] live retrieval failed', e);
    diag.reason = 'live retrieval request failure';
    diag.would_return_bundle = false;
    return { bundle: null, diag };
  }

  if (liveDiag) {
    diag.subreddits_searched = liveDiag.subreddits_searched;
    diag.live_requests_attempted = liveDiag.requests_attempted;
    diag.live_requests_succeeded = liveDiag.requests_succeeded;
    diag.live_requests_failed = liveDiag.requests_failed;
    diag.candidate_posts_found = liveDiag.candidate_posts_found;
    diag.threads_fetched = liveDiag.unique_threads_found;
    diag.threads_expanded = liveDiag.unique_threads_found > 0;
  }

  const usable = estimatedUsableUnits(liveRaw);
  diag.usable_units_extracted = usable;
  if (usable < MIN_LIVE_USABLE_UNITS) {
    diag.reason = `live attempted but usable units below minimum (${usable} < ${MIN_LIVE_USABLE_UNITS})`;
    diag.would_return_bundle = false;
    return { bundle: null, diag };
  }

  let bundle: TopicBundle;
  if (isCorpusDisabled()) {
    bundle = runPipelineFromRaw(normalized, displayName, liveRaw, 'live');
  } else {
    bundle = await buildFromCorpusMerge(
      normalized,
      displayName,
      liveRaw.map((raw) => ({ raw, mode: 'live' })),
      'live'
    );
  }
  diag.retrieval_mode = bundle.data_quality.retrieval_mode;
  diag.would_return_bundle = true;
  diag.reason =
    bundle.topic.analyzed_unit_count < THRESHOLDS.consensus
      ? 'thin live bundle returned (insufficient sample for some metrics; hidden via metric_eligibility)'
      : 'live bundle returned';
  return { bundle, diag };
}

export async function getTopicBySlugWithDiagnostics(slug: string): Promise<{
  bundle: TopicBundle | null;
  diagnostics: TopicResolutionDiagnostics;
}> {
  const normalized = slug.trim().toLowerCase();
  const displayName = slugToDisplayName(normalized);
  const currentMode = mode();
  const diag = emptyDiag(normalized);

  const stored = await loadTopicCorpus(normalized);
  diag.corpus_available = !!stored?.entries.length;

  if (currentMode === 'fixture') {
    const fixed = await loadBundleFixture(normalized);
    if (fixed) {
      const bundle = {
        ...fixed,
        data_quality: buildDataQuality(fixed.topic.analyzed_unit_count, 'fixture'),
      };
      diag.would_return_bundle = true;
      diag.reason = 'fixture bundle found';
      diag.retrieval_mode = 'fixture';
      return { bundle, diagnostics: diag };
    }
    diag.reason = 'fixture bundle missing';
  }

  if (currentMode === 'cache' && stored?.entries.length) {
    const bundle = buildFromStoredCorpusOnly(normalized, displayName, stored.entries);
    diag.would_return_bundle = true;
    diag.reason = 'served from stored corpus';
    diag.retrieval_mode = 'cache';
    diag.usable_units_extracted = bundle.topic.analyzed_unit_count;
    return { bundle, diagnostics: diag };
  }

  const replay = await loadReplayFixture(normalized);
  diag.replay_available = !!replay;
  if (replay && currentMode !== 'live') {
    const bundle = isCorpusDisabled()
      ? runPipelineFromRaw(replay.slug, replay.displayName, replay.units, 'replay')
      : await buildFromCorpusMerge(
          replay.slug,
          replay.displayName,
          replay.units.map((raw) => ({ raw, mode: 'replay' })),
          'replay'
        );
    diag.would_return_bundle = true;
    diag.reason = 'replay fixture found';
    diag.retrieval_mode = 'replay';
    diag.usable_units_extracted = bundle.topic.analyzed_unit_count;
    return { bundle, diagnostics: diag };
  }

  // Option B: broaden coverage by attempting live retrieval for unresolved topics.
  if (shouldAttemptLiveFallback(currentMode)) {
    const out = await attemptLiveResolution(normalized, displayName, diag);
    if (out.bundle) {
      return { bundle: out.bundle, diagnostics: out.diag };
    }
  }

  // Cache mode fallback when live produced no viable units.
  if (stored?.entries.length) {
    const bundle = buildFromStoredCorpusOnly(normalized, displayName, stored.entries);
    diag.would_return_bundle = true;
    diag.reason = 'live was not viable; served from stored corpus';
    diag.retrieval_mode = 'cache';
    diag.usable_units_extracted = bundle.topic.analyzed_unit_count;
    return { bundle, diagnostics: diag };
  }

  // Absolute last fallback for local fixture artifacts.
  const bundleFallback = await loadBundleFixture(normalized);
  if (bundleFallback) {
    const bundle = {
      ...bundleFallback,
      data_quality: buildDataQuality(bundleFallback.topic.analyzed_unit_count, 'fixture'),
    };
    diag.would_return_bundle = true;
    diag.reason = 'fallback bundle fixture found';
    diag.retrieval_mode = 'fixture';
    diag.usable_units_extracted = bundle.topic.analyzed_unit_count;
    return { bundle, diagnostics: diag };
  }

  diag.would_return_bundle = false;
  if (!diag.live_attempted && shouldAttemptLiveFallback(currentMode)) {
    diag.reason = 'unresolved topic but live retrieval was not attempted';
  } else if (!diag.live_attempted) {
    diag.reason = 'topic missing in replay/corpus and live fallback disabled';
  } else if (diag.candidate_posts_found === 0) {
    diag.reason = 'live attempted; no candidate posts found';
  }
  return { bundle: null, diagnostics: diag };
}

export async function getTopicBySlug(slug: string): Promise<TopicBundle | null> {
  const out = await getTopicBySlugWithDiagnostics(slug);
  return out.bundle;
}

export function personalizeTopic(
  bundle: TopicBundle,
  _body: PersonalizeRequest
): PersonalizeResponse {
  return {
    consensus: { ...bundle.consensus },
    personalization_note:
      'v1: age/sex are not applied to scoring; Reddit rarely provides them. No profile-aware model is enabled.',
  };
}
