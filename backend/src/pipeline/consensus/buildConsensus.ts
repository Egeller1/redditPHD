import type { ExperienceUnit } from '../../types/internal.js';
import type { ConsensusBlock, InsightsBlock } from '../../types/topicBundle.js';
import { THRESHOLDS } from '../../config/thresholds.js';

/** Natural sentence embedding for insight labels (avoid Title Case mid-sentence) */
function themeInSentence(name: string): string {
  if (!name) return name;
  return name.charAt(0).toLowerCase() + name.slice(1);
}

function buildSummaryText(
  topicDisplay: string,
  expected: number,
  n: number,
  topBenefits: string[],
  topSides: string[],
  thresholdMin: number
): string {
  const benefitStr = topBenefits.join(' and ');
  const sideStr = topSides[0] ?? null;
  const limitedSample = n < thresholdMin;

  let line1: string;
  let line2: string;

  if (expected >= 7.0) {
    line1 = benefitStr
      ? `You can expect real improvements in ${benefitStr} from ${topicDisplay}.`
      : `You can expect solid results from ${topicDisplay}.`;
    line2 = '';
  } else if (expected >= 5.5) {
    line1 = benefitStr
      ? `You can expect noticeable ${benefitStr} benefits from ${topicDisplay}.`
      : `You can expect moderate results from ${topicDisplay}.`;
    line2 = '';
  } else if (expected >= 4.5) {
    line1 = benefitStr
      ? `You might notice some ${benefitStr} improvements, but outcomes are mixed.`
      : `Outcomes are mixed — some people benefit, others don't notice much.`;
    line2 = '';
  } else {
    line1 = sideStr
      ? `Most people report a difficult experience with ${topicDisplay} — ${sideStr} is common.`
      : `Most people report disappointing results with ${topicDisplay}.`;
    line2 = benefitStr ? `Some notice minor ${benefitStr} benefits.` : '';
  }

  const caution = limitedSample ? ' Limited sample — treat as directional.' : '';
  return [line1 + (line2 ? ' ' + line2 : '') + caution].join('');
}

function variance(nums: number[]): number {
  if (nums.length === 0) return 0;
  const m = nums.reduce((a, b) => a + b, 0) / nums.length;
  return nums.reduce((s, x) => s + (x - m) ** 2, 0) / nums.length;
}

/**
 * Confidence 0–100 from sample size + spread of experience scores.
 * Tighter cap when n is small.
 */
export function computeConfidence(samples: number[]): number {
  if (samples.length === 0) return 0;
  if (samples.length < 2) return Math.min(45, 12 + samples.length * 6);

  let base: number;
  const v = variance(samples);
  const spreadPenalty = Math.min(38, Math.sqrt(v) * 7);
  const N = samples.length;
  const sizeBonus = Math.min(32, Math.log(N + 1) * 9);
  base = 42 + sizeBonus - spreadPenalty;

  if (N < THRESHOLDS.strongSampleMinUnits) {
    base = Math.min(base, 58);
  }
  return Math.max(8, Math.min(92, Math.round(base)));
}

export function buildConsensus(
  units: ExperienceUnit[],
  topicDisplay: string,
  insights: InsightsBlock
): ConsensusBlock {
  const scores = units.map((u) => u.experienceScore);
  const n = scores.length;
  const expected =
    n === 0 ? 0 : Math.round((scores.reduce((a, b) => a + b, 0) / n) * 10) / 10;
  const confidence = computeConfidence(scores);

  const topBenefits = insights.benefits.slice(0, 2).map((b) => themeInSentence(b.name));
  const topSides = insights.side_effects.slice(0, 1).map((b) => themeInSentence(b.name));

  let summary_text: string;
  if (n === 0) {
    summary_text = `We didn’t find enough readable discussions about ${topicDisplay} in the selected communities to summarize yet.`;
  } else {
    summary_text = buildSummaryText(
      topicDisplay,
      expected,
      n,
      topBenefits,
      topSides,
      THRESHOLDS.strongSampleMinUnits
    );
  }

  return {
    summary_text,
    expected_score: expected,
    confidence,
    sample_size: n,
  };
}
