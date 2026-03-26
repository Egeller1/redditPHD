import type { TopicBundle, ExperiencePost, DataQuality } from '../../types/topicBundle.js';
import type { ExperienceUnit } from '../../types/internal.js';
import { aggregateSentiment, aggregateDistribution, aggregateInsights } from '../aggregate/aggregate.js';
import { buildConsensus } from '../consensus/buildConsensus.js';
import { selectRepresentatives } from '../representatives/selectRepresentatives.js';
import { buildMetricEligibility } from '../eligibility/metricEligibility.js';
import { EXPERIENCE_SCORE_DEFINITION } from '../scoring/heuristicScorer.js';
import { THRESHOLDS } from '../../config/thresholds.js';
import { buildDataQuality } from './dataQuality.js';
import { normalizeDisplayText } from '../text/displayText.js';

function unitsToExperiencePosts(units: ExperienceUnit[]): ExperiencePost[] {
  return units.map((u) => ({
    id: u.id,
    score: u.experienceScore,
    username: u.username,
    excerpt: u.excerpt,
    url: u.url,
    timestamp_utc: u.timestamp_utc,
    age: u.extraction.age,
    sex: u.extraction.sex,
    category: u.category,
    subreddit: u.subreddit,
  }));
}

function distinctThreads(units: ExperienceUnit[]): number {
  return new Set(units.map((u) => u.raw.threadId)).size;
}

function distinctSubs(units: ExperienceUnit[]): number {
  return new Set(units.map((u) => u.subreddit.toLowerCase())).size;
}

function lowDataWarning(units: ExperienceUnit[]): string | null {
  if (units.length === 0) return null;
  if (units.length <= THRESHOLDS.lowDataWarningMaxUnits) {
    return normalizeDisplayText(
      `Thin sample (${units.length} quality-filtered posts/comments) - patterns are directional only.`
    );
  }
  return null;
}

export function buildTopicBundle(
  slug: string,
  displayName: string,
  units: ExperienceUnit[],
  options: { retrievalMode: DataQuality['retrieval_mode'] }
): TopicBundle {
  const insights = aggregateInsights(units);
  const consensus = buildConsensus(units, displayName, insights);
  const representative_posts = selectRepresentatives(units);
  const metric_eligibility = buildMetricEligibility(units);

  const distribution_stats = metric_eligibility.distribution_stats.shown
    ? aggregateDistribution(units)
    : null;

  const sentiment = aggregateSentiment(units);

  const topic = {
    id: `topic:${slug}`,
    slug,
    display_name: displayName,
    analyzed_unit_count: units.length,
    analyzed_thread_count: distinctThreads(units),
    subreddit_count: distinctSubs(units),
  };

  return {
    topic,
    consensus: {
      ...consensus,
      summary_text: normalizeDisplayText(consensus.summary_text),
    },
    sentiment,
    representative_posts,
    insights,
    experience_posts: unitsToExperiencePosts(units),
    distribution_stats,
    metric_eligibility,
    experience_score_definition: normalizeDisplayText(EXPERIENCE_SCORE_DEFINITION),
    low_data_warning: lowDataWarning(units),
    data_quality: buildDataQuality(units.length, options.retrievalMode),
  };
}
