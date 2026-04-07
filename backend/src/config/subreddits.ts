/** Fixed v1 universe — no dynamic discovery */
export const FIXED_SUBREDDITS = [
  'supplements',
  'nootropics',
  'biohackers',
  'biohacking',
  'nootropicsCommunity',
  'herbalism',
  'mentalhealth',
  'depression',
  'anxiety',
  'nutrition',
  'fitness',
  'bodybuilding',
  'moreplatesmoredates',
  'holistic',
  'sleep',
  'longevity',
  'Supplements',
] as const;

export type FixedSubreddit = (typeof FIXED_SUBREDDITS)[number];
