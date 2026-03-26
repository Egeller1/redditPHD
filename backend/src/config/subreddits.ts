/** Fixed v1 universe — no dynamic discovery */
export const FIXED_SUBREDDITS = [
  'supplements',
  'biohackers',
  'biohacking',
  'bodybuilding',
  'moreplatesmoredates',
  'nootropics',
] as const;

export type FixedSubreddit = (typeof FIXED_SUBREDDITS)[number];
