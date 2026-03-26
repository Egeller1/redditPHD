/**
 * Public API contract — matches frontend bundle for GET /topics/by-slug/:slug
 * Evidence-first: numeric claims must trace to pipeline aggregates over retrieved units.
 */

export type ExperienceCategory = 'negative' | 'neutral' | 'positive';

export type SexValue = 'male' | 'female' | 'other';

export type InsightConfidence = 'high' | 'medium' | 'low';

export interface TopicHeader {
  id: string;
  slug: string;
  display_name: string;
  /** Kept usable experience units after filtering */
  analyzed_unit_count: number;
  /** Distinct Reddit threads (link_id root or post id) represented */
  analyzed_thread_count: number;
  /** Distinct subreddits in analyzed units */
  subreddit_count: number;
}

export interface ConsensusBlock {
  summary_text: string;
  /** Topic-level expected experience score (e.g. mean of unit scores) */
  expected_score: number;
  /** 0–100 heuristic confidence from sample size + variance */
  confidence: number;
  sample_size: number;
}

export interface SentimentBlock {
  positive_percent: number;
  neutral_percent: number;
  negative_percent: number;
  sample_size: number;
}

export interface RepresentativePost {
  id: string;
  username: string | null;
  excerpt: string;
  url: string;
  timestamp_utc: string;
  /** Pipeline experience score 0–10 */
  score: number;
  /** Reddit API vote total for this post/comment (nullable if hidden) */
  reddit_score: number | null;
  subreddit: string;
}

/**
 * Either polarity may be null if no unit passed quality + polarity filters
 * (more honest than inventing a “worst case”).
 */
export interface RepresentativePosts {
  positive: RepresentativePost | null;
  negative: RepresentativePost | null;
}

export interface InsightItem {
  name: string;
  count: number;
  /** % of analyzed units mentioning this item */
  percent_of_units: number;
  /** Distinct threads with ≥1 mention */
  thread_count: number;
  confidence: InsightConfidence;
}

export interface ProtocolStackItem {
  name: string;
  count: number;
  percent_of_units: number;
}

export interface InsightsBlock {
  benefits: InsightItem[];
  side_effects: InsightItem[];
  protocols: ProtocolStackItem[];
  stacks: ProtocolStackItem[];
}

export interface ExperiencePost {
  id: string;
  score: number;
  username: string | null;
  excerpt: string;
  url: string;
  timestamp_utc: string;
  age: number | null;
  sex: SexValue | null;
  category: ExperienceCategory;
  subreddit: string;
}

export interface DistributionBucketStats {
  mean: number;
  p25: number;
  p75: number;
  count: number;
}

export interface DistributionStats {
  negative: DistributionBucketStats;
  neutral: DistributionBucketStats;
  positive: DistributionBucketStats;
}

export interface MetricEligibilityEntry {
  shown: boolean;
  sample_size: number;
  reason_hidden: string | null;
}

export interface MetricEligibility {
  consensus: MetricEligibilityEntry;
  sentiment: MetricEligibilityEntry;
  benefits: MetricEligibilityEntry;
  side_effects: MetricEligibilityEntry;
  protocols: MetricEligibilityEntry;
  stacks: MetricEligibilityEntry;
  distribution_stats: MetricEligibilityEntry;
}

export interface DataQuality {
  sample_strength: 'low' | 'medium' | 'high';
  /** `cache` = persisted corpus only (no Reddit fetch this request). */
  retrieval_mode: 'fixture' | 'replay' | 'live' | 'cache';
  scoring_version: string;
  taxonomy_version: string;
}

export interface TopicBundle {
  topic: TopicHeader;
  consensus: ConsensusBlock;
  sentiment: SentimentBlock;
  representative_posts: RepresentativePosts;
  insights: InsightsBlock;
  experience_posts: ExperiencePost[];
  /** Null when `metric_eligibility.distribution_stats.shown` is false — never “usable” while hidden */
  distribution_stats: DistributionStats | null;
  metric_eligibility: MetricEligibility;
  /** Plain-language meaning of per-unit scores (same for all topics in v1) */
  experience_score_definition: string;
  /** Set when the corpus is small even if some metrics are shown */
  low_data_warning: string | null;
  data_quality: DataQuality;
}

/** POST /topics/:slug/personalize — v1 may return unchanged consensus + note */
export interface PersonalizeRequest {
  age: number | null;
  sex: SexValue | null;
}

export interface PersonalizeResponse {
  consensus: ConsensusBlock;
  personalization_note: string | null;
}
