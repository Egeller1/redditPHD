import type { MetricEligibility } from '../../types/topicBundle.js';
import type { ExperienceUnit } from '../../types/internal.js';
import { THRESHOLDS } from '../../config/thresholds.js';

function entry(
  shown: boolean,
  sampleSize: number,
  reason: string | null
): MetricEligibility[keyof MetricEligibility] {
  return { shown, sample_size: sampleSize, reason_hidden: reason };
}

export function distributionStatsEligible(units: ExperienceUnit[]): boolean {
  const n = units.length;
  if (n < THRESHOLDS.distribution) return false;
  return ['negative', 'neutral', 'positive'].every((cat) => {
    const c = units.filter((u) => u.category === cat).length;
    return c === 0 || c >= THRESHOLDS.distributionBucket;
  });
}

export function buildMetricEligibility(units: ExperienceUnit[]): MetricEligibility {
  const n = units.length;
  const reason = (min: number) =>
    n < min ? `Insufficient sample size (n=${n}; minimum ${min})` : null;

  const distOk = distributionStatsEligible(units);

  return {
    consensus: entry(n >= THRESHOLDS.consensus, n, reason(THRESHOLDS.consensus)),
    sentiment: entry(n >= THRESHOLDS.sentiment, n, reason(THRESHOLDS.sentiment)),
    benefits: entry(n >= THRESHOLDS.insights, n, reason(THRESHOLDS.insights)),
    side_effects: entry(n >= THRESHOLDS.insights, n, reason(THRESHOLDS.insights)),
    protocols: entry(n >= THRESHOLDS.protocols, n, reason(THRESHOLDS.protocols)),
    stacks: entry(n >= THRESHOLDS.stacks, n, reason(THRESHOLDS.stacks)),
    distribution_stats: entry(
      distOk,
      n,
      distOk ? null : 'Hidden until the sample is large enough for stable bucket stats'
    ),
  };
}
