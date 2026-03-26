import type { LabeledSignal } from './lexicon.js';

/**
 * Extra theme rows keyed by slug — applied only for that topic.
 * Prefer specific phrases over generic lexicon leakage.
 */
export const TOPIC_EXTRA_BENEFITS: Record<string, LabeledSignal[]> = {
  ashwagandha: [
    {
      patterns: ['cortisol', 'adaptogen', 'adaptogenic', 'withanolide'],
      label: 'Stress & cortisol (mentioned)',
    },
    {
      patterns: ['anxiety', 'anxious', 'calm', 'calmer', 'relax', 'relaxation'],
      label: 'Calm / anxiety discussion',
    },
  ],
  caffeine: [
    {
      patterns: ['tolerance', 'tolerant', 'caffeine withdrawal', 'quit caffeine'],
      label: 'Tolerance / dependence (mentioned)',
    },
    {
      patterns: ['coffee', 'espresso', 'tea', 'pre-workout caffeine'],
      label: 'Source / dose habit (coffee, tea, etc.)',
    },
  ],
  'intermittent-fasting': [
    {
      patterns: ['eating window', 'feeding window', 'fasting window', '16:8', '18:6', '20:4', 'omad'],
      label: 'Fasting / eating windows',
    },
    {
      patterns: ['autophagy', 'ketosis', 'ketotic'],
      label: 'Metabolic state (mentioned)',
    },
    {
      patterns: ['hunger', 'appetite', 'cravings', 'less hungry'],
      label: 'Appetite & hunger',
    },
    {
      patterns: ['weight loss', 'lose weight', 'fat loss', 'lbs down', 'kg down'],
      label: 'Weight change (mentioned)',
    },
  ],
  'cold-showers': [
    {
      patterns: ['cold shower', 'cold showers', 'freezing shower', 'icy shower'],
      label: 'Cold shower habit (mentioned)',
    },
    {
      patterns: ['brown fat', 'thermogenesis', 'cold adaptation', 'cold exposure'],
      label: 'Cold adaptation / thermoregulation',
    },
    {
      patterns: ['immune', 'immunity', 'sick less', 'fewer colds'],
      label: 'Immune / illness (mentioned)',
    },
    {
      patterns: ['discipline', 'willpower', 'mental toughness'],
      label: 'Discipline / mental resilience',
    },
    {
      patterns: ['ice bath', 'wim hof', 'cold plunge'],
      label: 'Cold therapy modalities',
    },
  ],
};

export const TOPIC_EXTRA_SIDES: Record<string, LabeledSignal[]> = {
  caffeine: [
    {
      patterns: ['jitters', 'jittery', 'heart racing', 'racing heart', 'palpitation'],
      label: 'Stimulant overstimulation (mentioned)',
    },
    {
      patterns: ['caffeine withdrawal', 'withdrawal headache', 'quit caffeine'],
      label: 'Withdrawal (mentioned)',
    },
  ],
  'intermittent-fasting': [
    {
      patterns: ['binge', 'binging', 'overate', 'overeating after'],
      label: 'Rebound eating (mentioned)',
    },
    {
      patterns: ['hypoglycem', 'low blood sugar', 'dizzy when fasting'],
      label: 'Low energy / dizziness (fasting)',
    },
  ],
  'cold-showers': [
    {
      patterns: ['hypotherm', 'too cold', 'shivering badly', 'raynaud'],
      label: 'Cold intolerance / discomfort',
    },
  ],
};
