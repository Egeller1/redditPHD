/**
 * Theme extraction lexicon: **Layer 2** (topic-gated themes) sits on top of generic stance/scoring.
 * Do not use ultra-short substrings like `performance` that fire on unrelated contexts.
 */
export interface LabeledSignal {
  patterns: string[];
  label: string;
}

/** Benefit / side-effect row with optional domain gate */
export interface ThemedBenefitSignal extends LabeledSignal {
  /**
   * When true: only counted if topic is fitness-first (e.g. creatine) OR text has a lifting anchor
   * (squat, hypertrophy, PR, etc.).
   */
  fitnessGated?: boolean;
}

export interface ThemedSideEffectSignal extends LabeledSignal {
  /**
   * Phrases common in creatine threads; suppress unless creatine topic or creatine mentioned in text
   * (reduces “water weight” surfacing for unrelated searches).
   */
  creatineWeightSignal?: boolean;
}

export interface ThemedProtocolSignal extends LabeledSignal {
  /** Typical creatine dosing / loading — only when creatine context applies */
  creatineContext?: boolean;
}

/**
 * Global benefit patterns (narrow; no naked `performance` → PR mapping).
 * See `docs/TAXONOMY_AUDIT.md` for label assignment path.
 */
export const BENEFIT_SIGNALS: ThemedBenefitSignal[] = [
  {
    patterns: [
      'strength training',
      'lifting more',
      'lift more',
      'heavier weight',
      'in the gym',
      'squat',
      'bench',
      'deadlift',
      'progressive overload',
      'one rep max',
    ],
    label: 'Strength & power',
    fitnessGated: true,
  },
  { patterns: ['recovery', 'recover', 'recovered', 'recover faster', 'recover better'], label: 'Recovery between sessions' },
  {
    patterns: ['endurance', 'cardio', 'running', 'jogging', 'cycling', 'conditioning'],
    label: 'Endurance & conditioning',
  },
  { patterns: ['energy', 'fatigue', 'less tired', 'more awake'], label: 'Energy levels' },
  {
    patterns: ['focus', 'cognition', 'cognitive', 'mental clarity', 'concentration'],
    label: 'Focus & cognition',
  },
  { patterns: ['sleep', 'sleeping', 'slept better', 'insomnia improved'], label: 'Sleep' },
  { patterns: ['mood', 'felt happier', 'depression', 'less anxious'], label: 'Mood' },
  { patterns: ['hydration', 'water intake', 'drank more water'], label: 'Adequate water intake' },
  {
    patterns: ['personal record', 'new pr', 'hit a pr', 'gym pr', 'pr on'],
    label: 'Heavier lifts / PRs',
    fitnessGated: true,
  },
  {
    patterns: ['muscle mass', 'hypertrophy', 'lean mass', 'muscle gain'],
    label: 'Muscle & body composition',
    fitnessGated: true,
  },
];

export const SIDE_EFFECT_SIGNALS: ThemedSideEffectSignal[] = [
  { patterns: ['bloat', 'bloating'], label: 'Bloating' },
  {
    patterns: ['water weight', 'water retention', 'held water'],
    label: 'Water retention',
    creatineWeightSignal: true,
  },
  { patterns: ['cramp', 'cramping'], label: 'Cramping' },
  { patterns: ['nausea'], label: 'Nausea' },
  { patterns: ['headache', 'headaches'], label: 'Headaches' },
  { patterns: ['insomnia', 'sleep issues', "couldn't sleep"], label: 'Sleep disruption' },
  { patterns: ['anxiety', 'anxious', 'panic'], label: 'Anxiety' },
  { patterns: ['stomach', 'digestive', 'gi upset', 'bathroom', 'diarrhea'], label: 'Digestive discomfort' },
  { patterns: ['acne', 'breakout'], label: 'Acne / skin' },
  { patterns: ['hair loss', 'hair shedding', 'shedding hair'], label: 'Hair shedding' },
  { patterns: ['kidney'], label: 'Kidney concern (mentioned)' },
  { patterns: ['liver'], label: 'Liver concern (mentioned)' },
];

export const PROTOCOL_SIGNALS: ThemedProtocolSignal[] = [
  { patterns: ['loading phase'], label: 'Loading phase', creatineContext: true },
  {
    patterns: ['5g', '5 g', '3-5', '3–5', '5 grams', '3g daily', '5g daily'],
    label: 'Daily dose (~3-5 g)',
    creatineContext: true,
  },
  { patterns: ['daily', 'every day', 'each day'], label: 'Daily consistency' },
  { patterns: ['cycle', 'cycling off'], label: 'Cycling protocol' },
  { patterns: ['with food', 'after meal', 'with breakfast'], label: 'With food' },
  { patterns: ['before workout', 'pre workout'], label: 'Pre-workout timing' },
  { patterns: ['after workout', 'post workout'], label: 'Post-workout timing' },
  { patterns: ['maintenance dose', 'maintenance dosing'], label: 'Maintenance dosing' },
];

export const STACK_SIGNALS: LabeledSignal[] = [
  { patterns: ['with creatine'], label: 'With creatine (other supps)' },
  { patterns: ['with protein'], label: 'With protein' },
  { patterns: ['beta alanine', 'beta-alanine'], label: 'With beta-alanine' },
  { patterns: ['stack', 'combined with', 'alongside'], label: 'Stacked supplements' },
];

export const POSITIVE_SENTIMENT_TERMS = [
  'works well',
  'helped',
  'great',
  'love',
  'recommend',
  'noticed',
  'effective',
  'worth it',
  'happy with',
  'positive experience',
  'like the',
  'enjoy',
  'love it',
  'works for me',
  'good results',
  'really helped',
];

export const NEGATIVE_SENTIMENT_TERMS = [
  "didn't work",
  'did not work',
  'stopped taking',
  'had to stop',
  'worst',
  'waste of',
  'regret',
  'bad experience',
  'would not recommend',
  'severe bloating',
  'severe cramps',
  'unbearable',
  'get insomnia',
  'getting insomnia',
  'gives me a headache',
  'gives me headaches',
  'caused insomnia',
  'get headaches',
  'got a headache',
  'side effects are',
  'experiencing side effects',
];
