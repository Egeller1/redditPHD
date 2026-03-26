/** Minimum units before surfacing aggregates */
export const THRESHOLDS = {
  consensus: 5,
  sentiment: 8,
  insights: 8,
  distribution: 10,
  protocols: 8,
  stacks: 8,
  /** Per-bucket minimum for meaningful p25/p75 (non-empty buckets only) */
  distributionBucket: 3,
  representativeMinBody: 80,
  maxExperiencePosts: 500,
  /** Dedup similarity: Jaccard on token sets below this = duplicate */
  dedupJaccard: 0.85,
  /** Representative slots: clear stance separation */
  repPositiveMinScore: 7.5,
  repNegativeMaxScore: 3.5,
  /** Bundle-level warning when sample is thin */
  lowDataWarningMaxUnits: 18,
  /** Below this, consensus confidence is capped harder */
  strongSampleMinUnits: 25,
} as const;
