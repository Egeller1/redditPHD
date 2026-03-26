import type { TopicPipelineContext } from '../../types/internal.js';

/** Topics where fitness/lifting-themed benefits are allowed without a local anchor in text. */
export const FITNESS_FIRST_SLUGS = new Set(
  ['creatine', 'whey', 'whey-protein', 'pre-workout', 'preworkout', 'beta-alanine', 'bcaa'].map((s) =>
    s.toLowerCase()
  )
);

/** Slugs that get extra topic-specific theme rows (see topicExtraSignals). */
export type TopicSlugKey =
  | 'ashwagandha'
  | 'caffeine'
  | 'intermittent-fasting'
  | 'cold-showers'
  | string;

export function normalizeTopicSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

/**
 * Local evidence of barbell / hypertrophy discussion — required before fitness-gated benefit labels
 * for topics that are not FITNESS_FIRST_SLUGS.
 */
export function hasFitnessAnchor(text: string): boolean {
  return /\b(gym|squat|squats|bench|deadlift|leg day|push day|pull day|hypertrophy|1rm|one rep max|weight room|compound (lift|movement)|powerlifting|bodybuilding|olympic lifting|progressive overload|personal record|\bpr\b)\b/i.test(
    text
  );
}

/** Creatine dosing / loading protocol cues apply when topic is creatine or text is clearly about creatine. */
export function hasCreatineProtocolContext(slug: string, text: string): boolean {
  const s = normalizeTopicSlug(slug);
  if (s === 'creatine') return true;
  return /\bcreatine\b/i.test(text);
}

export function allowFitnessThemedBenefits(ctx: TopicPipelineContext, text: string): boolean {
  if (FITNESS_FIRST_SLUGS.has(normalizeTopicSlug(ctx.slug))) return true;
  return hasFitnessAnchor(text);
}

export function allowCreatineHeavySideEffectContext(slug: string, text: string): boolean {
  const s = normalizeTopicSlug(slug);
  if (s === 'creatine') return true;
  if (/\bcreatine\b/i.test(text)) return true;
  return false;
}
