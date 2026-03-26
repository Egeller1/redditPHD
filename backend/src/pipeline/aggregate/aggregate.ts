import type { ExperienceUnit } from '../../types/internal.js';
import type {
  DistributionStats,
  InsightConfidence,
  InsightsBlock,
  SentimentBlock,
} from '../../types/topicBundle.js';

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * q)));
  return sorted[idx]!;
}

function insightConfidence(count: number): InsightConfidence {
  if (count >= 10) return 'high';
  if (count >= 5) return 'medium';
  return 'low';
}

/** Drop ultra-rare theme labels (prefer fewer accurate rows). */
function minThemeUnitSupport(n: number): number {
  if (n < 1) return 999;
  return Math.max(2, Math.ceil(n * 0.02));
}

export function aggregateSentiment(units: ExperienceUnit[]): SentimentBlock {
  const n = units.length;
  if (n === 0) {
    return { positive_percent: 0, neutral_percent: 0, negative_percent: 0, sample_size: 0 };
  }
  let pos = 0,
    neu = 0,
    neg = 0;
  for (const u of units) {
    if (u.category === 'positive') pos++;
    else if (u.category === 'neutral') neu++;
    else neg++;
  }
  const f = 100 / n;
  return {
    positive_percent: Math.round(pos * f * 10) / 10,
    neutral_percent: Math.round(neu * f * 10) / 10,
    negative_percent: Math.round(neg * f * 10) / 10,
    sample_size: n,
  };
}

export function aggregateDistribution(units: ExperienceUnit[]): DistributionStats {
  const buckets = {
    negative: [] as number[],
    neutral: [] as number[],
    positive: [] as number[],
  };
  for (const u of units) {
    buckets[u.category].push(u.experienceScore);
  }
  (['negative', 'neutral', 'positive'] as const).forEach((k) => {
    buckets[k].sort((a, b) => a - b);
  });
  const mk = (arr: number[]) => {
    if (arr.length === 0) {
      return { mean: 0, p25: 0, p75: 0, count: 0 };
    }
    const mean = arr.reduce((s, x) => s + x, 0) / arr.length;
    return {
      mean: Math.round(mean * 100) / 100,
      p25: quantile(arr, 0.25),
      p75: quantile(arr, 0.75),
      count: arr.length,
    };
  };
  return {
    negative: mk(buckets.negative),
    neutral: mk(buckets.neutral),
    positive: mk(buckets.positive),
  };
}

type Counted = Map<string, { units: Set<string>; threads: Set<string> }>;

function countLabels(
  units: ExperienceUnit[],
  pick: (u: ExperienceUnit) => string[]
): Counted {
  const m: Counted = new Map();
  for (const u of units) {
    const labels = pick(u);
    for (const label of labels) {
      if (!m.has(label)) m.set(label, { units: new Set(), threads: new Set() });
      const e = m.get(label)!;
      e.units.add(u.id);
      e.threads.add(u.raw.threadId);
    }
  }
  return m;
}

export function aggregateInsights(units: ExperienceUnit[]): InsightsBlock {
  const n = units.length || 1;
  const benefits = countLabels(units, (u) => u.extraction.benefitMentions);
  const sideEffects = countLabels(units, (u) => u.extraction.sideEffectMentions);
  const protocols = countLabels(units, (u) => u.extraction.protocolMentions);
  const stacks = countLabels(units, (u) => u.extraction.stackMentions);
  const themeFloor = minThemeUnitSupport(units.length);

  const toInsight = (m: Counted, applyThemeFloor: boolean): InsightsBlock['benefits'] => {
    return [...m.entries()]
      .map(([name, v]) => ({
        name,
        count: v.units.size,
        percent_of_units: Math.round((v.units.size / n) * 1000) / 10,
        thread_count: v.threads.size,
        confidence: insightConfidence(v.units.size),
      }))
      .filter((row) => !applyThemeFloor || row.count >= themeFloor)
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  };

  const toSimple = (m: Counted): InsightsBlock['protocols'] => {
    return [...m.entries()]
      .map(([name, v]) => ({
        name,
        count: v.units.size,
        percent_of_units: Math.round((v.units.size / n) * 1000) / 10,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  };

  return {
    benefits: toInsight(benefits, true),
    side_effects: toInsight(sideEffects, true),
    protocols: toSimple(protocols),
    stacks: toSimple(stacks),
  };
}
