function intEnv(name: string, defaultValue: number): number {
  const v = process.env[name];
  if (v == null || v === '') return defaultValue;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : defaultValue;
}

function boolEnv(name: string): boolean {
  const v = process.env[name]?.toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

/**
 * Safe scaling for retrieval + corpus growth (env-tunable, conservative defaults).
 */
export const SAMPLING = {
  /** Design target for “enough” analyzed units (informational; drives copy via sample_strength cutoffs). */
  targetAnalyzedUnitCount: intEnv('TARGET_ANALYZED_UNITS', 60),

  /** Stop live subreddit search after this many distinct posts (across all subs + query variants). */
  maxCandidatePostsPerRun: intEnv('MAX_CANDIDATE_POSTS_PER_RUN', 350),

  /** Additional cap on distinct threads (post `threadId`) collected in one live run. */
  maxThreadsExpandPerRun: intEnv('MAX_THREADS_EXPAND_PER_RUN', 200),

  /** After filter + dedupe, at most this many raw units feed scoring for a single response. */
  maxUsableUnitsPerRun: intEnv('MAX_USABLE_UNITS_PER_RUN', 500),

  maxCorpusEntries: intEnv('MAX_CORPUS_ENTRIES', 6000),

  /** Reddit `limit` per search request (max 100). */
  redditSearchLimitPerRequest: Math.min(
    100,
    Math.max(5, intEnv('REDDIT_SEARCH_LIMIT', 100))
  ),

  liveRequestDelayMs: Math.max(200, intEnv('LIVE_REQUEST_DELAY_MS', 400)),

  sampleStrengthLowBelow: intEnv('SAMPLE_STRENGTH_LOW_BELOW', 15),
  sampleStrengthMediumBelow: intEnv('SAMPLE_STRENGTH_MEDIUM_BELOW', 45),

} as const;

export function isCorpusDisabled(): boolean {
  return boolEnv('CORPUS_DISABLED');
}

export function samplingDiagnosticsEnabled(slug: string): boolean {
  if (boolEnv('CORPUS_DIAGNOSTICS')) return true;
  const slugs = (process.env.CORPUS_DIAGNOSTICS_SLUGS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return slugs.includes(slug.trim().toLowerCase());
}
