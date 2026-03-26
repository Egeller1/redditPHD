/**
 * Experience score -> sentiment bucket (dot plot, aggregates).
 *
 * | Bucket    | Score range   | Meaning (heuristic) |
 * |-----------|---------------|----------------------|
 * | negative  | [0, 4.5)     | Clearly poor / harmful / regret |
 * | neutral   | [4.5, 6.5)   | Mixed, modest, protocol-only, or unclear |
 * | positive  | [6.5, 10]    | Clearly net-positive experience |
 *
 * Wider neutral band avoids labeling scores like 6.1 as "positive" when the text is mixed/protocol-style.
 */
export const CATEGORY = {
  negativeMax: 4.5,
  positiveMin: 6.5,
} as const;

export function scoreToCategory(score: number): 'negative' | 'neutral' | 'positive' {
  if (score < CATEGORY.negativeMax) return 'negative';
  if (score < CATEGORY.positiveMin) return 'neutral';
  return 'positive';
}
