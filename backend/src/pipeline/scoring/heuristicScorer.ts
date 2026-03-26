import type { Scorer } from '../../types/internal.js';
import type { RawRedditUnit, StructuredExtraction } from '../../types/internal.js';
import { scoreToCategory } from './thresholds.js';

export { scoreToCategory };

/**
 * **Experience score (0–10)** — per-unit subjective quality of self-reported experience
 * with the topic in this text (post/comment). It is **not** Reddit’s vote `score`.
 *
 * Category buckets (see `scoreToCategory`): negative &lt; 4.5, neutral 4.5–6.5, positive ≥ 6.5.
 */
export const EXPERIENCE_SCORE_DEFINITION =
  'Per-post 0-10 self-reported experience quality for this topic. Categories: below 4.5 clearly poor, 4.5 to under 6.5 mixed or modest, 6.5 and up clearly positive. Independent of Reddit vote totals.';

function fullText(unit: RawRedditUnit): string {
  return `${unit.title ?? ''}\n${unit.body}`;
}

function isExploratoryOrUnderpoweredPositive(text: string): boolean {
  const t = text.toLowerCase();
  if (/\b(any|does anyone|thoughts on|worth trying)\b.*\?/i.test(t)) return true;
  if (/\bmixed results\b|\bnothing dramatic\b|\bsubtle\b|\bmild\b|\bnot sure\b/i.test(t)) return true;
  if (/\bcognitive\b|\bnootropic\b/i.test(t) && /\b(mixed|subtle|mild|unclear|question)\b/i.test(t))
    return true;
  return false;
}

/** Mostly timing/protocol/stack without a strong outcome claim */
function isProtocolMetaDiscussion(text: string): boolean {
  const t = text.toLowerCase();
  const looksMeta =
    /\bprotocol question\b/i.test(t) ||
    /\b(what mattered most was|timing vs|loading phase seemed unnecessary)\b/i.test(t);
  if (!looksMeta) return false;
  return !hasStrongPositiveOutcome(text);
}

function hasStrongNegativeOutcome(text: string): boolean {
  return /\b(stopped|quit|hospital|emergency|severe|unbearable|worst|regret)\b/i.test(text);
}

function hasStrongPositiveOutcome(text: string): boolean {
  const t = text.toLowerCase();
  if (/\b(nothing|not|without)\s+dramatic\b/i.test(t)) return false;
  return /\b(recommend|love it|game changer|huge gains|massive gains|dramatic improvement|works great|very happy)\b/i.test(
    text
  );
}

/**
 * First-hand posts agreeing with others or reporting concrete benefits — often `stance: unclear`
 * because Reddit wording skips stock “positive” phrases.
 */
function mildFirstHandBenefitBoost(text: string, extraction: StructuredExtraction): number {
  if (!extraction.firstHand || extraction.benefitMentions.length < 1) return 0;
  if (/\bsame here\b/i.test(text)) return 0.75;
  if (
    (extraction.stance === 'positive' || extraction.stance === 'unclear') &&
    /\b(felt|noticed)\b/i.test(text)
  ) {
    return 0.35;
  }
  return 0;
}

export class HeuristicScorer implements Scorer {
  score(unit: RawRedditUnit, extraction: StructuredExtraction): number {
    const text = fullText(unit);
    const t = text.toLowerCase();

    let s = 5.2;

    switch (extraction.stance) {
      case 'positive':
        s = 6.8;
        break;
      case 'negative':
        s = 3.4;
        break;
      case 'mixed':
        s = 5.1;
        break;
      default:
        s = 5.2;
    }

    s += Math.min(1.4, extraction.benefitMentions.length * 0.35);
    s -= Math.min(2.2, extraction.sideEffectMentions.length * 0.45);

    if (extraction.firstHand) s += 0.25;
    if (extraction.hearsay) s -= 0.35;

    s += mildFirstHandBenefitBoost(text, extraction);

    if (extraction.stance === 'mixed' || isExploratoryOrUnderpoweredPositive(text)) {
      s = Math.min(s, 6.4);
      if (extraction.stance === 'mixed') s = Math.max(4.0, s - 0.3);
    }

    if (extraction.stance === 'positive' && !hasStrongPositiveOutcome(text)) {
      s = Math.min(s, 7.9);
    }

    if (extraction.stance === 'negative' || hasStrongNegativeOutcome(text)) {
      s -= 0.8;
    }

    /** Protocol / timing threads without a strong outcome: keep out of the "clearly positive" band */
    if (isProtocolMetaDiscussion(text)) {
      s = Math.min(s, 6.35);
    }

    const up = unit.score;
    if (typeof up === 'number') {
      if (up >= 50) s += 0.35;
      else if (up >= 10) s += 0.15;
      else if (up < 0) s -= 0.2;
    }

    if (extraction.stance !== 'negative' && !hasStrongNegativeOutcome(text)) {
      s = Math.max(s, 4.2);
    }

    if (/\bcognitive\b|\bnootropic\b/i.test(t) && !hasStrongPositiveOutcome(text)) {
      s = Math.min(s, 6.45);
    }

    const exploratoryOrNonEndorsement =
      isExploratoryOrUnderpoweredPositive(text) ||
      /\bmixed results\b/i.test(text) ||
      /\bwould not call\b.*\bnootropic\b/i.test(text) ||
      (/\bcognitive\b|\bnootropic\b/i.test(t) &&
        /\b(mild|subtle|nothing dramatic|unchanged|unclear)\b/i.test(t));
    if (exploratoryOrNonEndorsement && !hasStrongPositiveOutcome(text)) {
      s = Math.min(s, 6.4);
    }

    s = Math.max(0, Math.min(10, s));
    return Math.round(s * 10) / 10;
  }
}
