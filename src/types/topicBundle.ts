/**
 * Sync with `backend/src/types/topicBundle.ts` — API contract for GET /topics/by-slug/:slug
 */
export type ExperienceCategory = 'negative' | 'neutral' | 'positive';

export type SexValue = 'male' | 'female' | 'other';

export type InsightConfidence = 'high' | 'medium' | 'low';

export interface TopicHeader {
  id: string;
  slug: string;
  display_name: string;
  analyzed_unit_count: number;
  analyzed_thread_count: number;
  subreddit_count: number;
}

export interface ConsensusBlock {
  summary_text: string;
  expected_score: number;
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
  score: number;
  reddit_score: number | null;
  subreddit: string;
}

export interface RepresentativePosts {
  positive: RepresentativePost | null;
  negative: RepresentativePost | null;
}

export interface InsightItem {
  name: string;
  count: number;
  percent_of_units: number;
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
  distribution_stats: DistributionStats | null;
  metric_eligibility: MetricEligibility;
  experience_score_definition: string;
  low_data_warning: string | null;
  data_quality: DataQuality;
}

export interface PersonalizeRequest {
  age: number | null;
  sex: SexValue | null;
}

export interface PersonalizeResponse {
  consensus: ConsensusBlock;
  personalization_note: string | null;
}
