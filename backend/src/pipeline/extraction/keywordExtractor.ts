import type { StructuredExtraction, TopicPipelineContext } from '../../types/internal.js';
import type { SexValue } from '../../types/topicBundle.js';
import {
  BENEFIT_SIGNALS,
  NEGATIVE_SENTIMENT_TERMS,
  POSITIVE_SENTIMENT_TERMS,
  PROTOCOL_SIGNALS,
  SIDE_EFFECT_SIGNALS,
  STACK_SIGNALS,
} from '../../config/lexicon.js';
import { TOPIC_EXTRA_BENEFITS, TOPIC_EXTRA_SIDES } from '../../config/topicExtraSignals.js';
import {
  allowCreatineHeavySideEffectContext,
  allowFitnessThemedBenefits,
  hasCreatineProtocolContext,
  normalizeTopicSlug,
} from './topicTheme.js';

const BOT_AUTHORS = new Set(
  ['automoderator', 'autmod', '[deleted]'].map((s) => s.toLowerCase())
);

export function normText(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

export type ThemeDiagnosticHit = {
  layer: 'benefit' | 'side_effect' | 'protocol' | 'stack';
  label: string;
  patternMatched: string;
  source: 'global' | 'topic_extra';
  dropped?: 'fitness_gate' | 'creatine_side_gate' | 'creatine_protocol_gate';
};

export type ThemeDiagnostics = { hits: ThemeDiagnosticHit[] };

function collectBenefits(
  text: string,
  ctx: TopicPipelineContext,
  diag: ThemeDiagnostics | undefined
): string[] {
  const t = normText(text);
  const allowFitness = allowFitnessThemedBenefits(ctx, text);
  const labels = new Set<string>();

  for (const row of BENEFIT_SIGNALS) {
    for (const p of row.patterns) {
      if (!t.includes(normText(p))) continue;
      if (row.fitnessGated && !allowFitness) {
        diag?.hits.push({
          layer: 'benefit',
          label: row.label,
          patternMatched: p,
          source: 'global',
          dropped: 'fitness_gate',
        });
        continue;
      }
      diag?.hits.push({ layer: 'benefit', label: row.label, patternMatched: p, source: 'global' });
      labels.add(row.label);
      break;
    }
  }

  const slug = normalizeTopicSlug(ctx.slug);
  const extras = TOPIC_EXTRA_BENEFITS[slug];
  if (extras) {
    for (const row of extras) {
      for (const p of row.patterns) {
        if (!t.includes(normText(p))) continue;
        diag?.hits.push({
          layer: 'benefit',
          label: row.label,
          patternMatched: p,
          source: 'topic_extra',
        });
        labels.add(row.label);
        break;
      }
    }
  }

  return [...labels];
}

function collectSideEffects(
  text: string,
  ctx: TopicPipelineContext,
  diag: ThemeDiagnostics | undefined
): string[] {
  const t = normText(text);
  const labels = new Set<string>();
  const creatineCtx = allowCreatineHeavySideEffectContext(ctx.slug, text);

  for (const row of SIDE_EFFECT_SIGNALS) {
    for (const p of row.patterns) {
      if (!t.includes(normText(p))) continue;
      if (row.creatineWeightSignal && !creatineCtx) {
        diag?.hits.push({
          layer: 'side_effect',
          label: row.label,
          patternMatched: p,
          source: 'global',
          dropped: 'creatine_side_gate',
        });
        continue;
      }
      diag?.hits.push({
        layer: 'side_effect',
        label: row.label,
        patternMatched: p,
        source: 'global',
      });
      labels.add(row.label);
      break;
    }
  }

  const slug = normalizeTopicSlug(ctx.slug);
  const extras = TOPIC_EXTRA_SIDES[slug];
  if (extras) {
    for (const row of extras) {
      for (const p of row.patterns) {
        if (!t.includes(normText(p))) continue;
        diag?.hits.push({
          layer: 'side_effect',
          label: row.label,
          patternMatched: p,
          source: 'topic_extra',
        });
        labels.add(row.label);
        break;
      }
    }
  }

  return [...labels];
}

function collectProtocols(
  text: string,
  ctx: TopicPipelineContext,
  diag: ThemeDiagnostics | undefined
): string[] {
  const t = normText(text);
  const labels = new Set<string>();
  const cCtx = hasCreatineProtocolContext(ctx.slug, text);

  for (const row of PROTOCOL_SIGNALS) {
    for (const p of row.patterns) {
      if (!t.includes(normText(p))) continue;
      if (row.creatineContext && !cCtx) {
        diag?.hits.push({
          layer: 'protocol',
          label: row.label,
          patternMatched: p,
          source: 'global',
          dropped: 'creatine_protocol_gate',
        });
        continue;
      }
      diag?.hits.push({ layer: 'protocol', label: row.label, patternMatched: p, source: 'global' });
      labels.add(row.label);
      break;
    }
  }
  return [...labels];
}

function collectStacks(text: string, diag: ThemeDiagnostics | undefined): string[] {
  const t = normText(text);
  const labels = new Set<string>();
  for (const row of STACK_SIGNALS) {
    for (const p of row.patterns) {
      if (!t.includes(normText(p))) continue;
      diag?.hits.push({ layer: 'stack', label: row.label, patternMatched: p, source: 'global' });
      labels.add(row.label);
      break;
    }
  }
  return [...labels];
}

/** Layer 1 + 2: stance/sentiment (generic) + topic-gated theme labels */
export function extractStructured(
  text: string,
  ctx: TopicPipelineContext,
  diagnostics?: ThemeDiagnostics
): StructuredExtraction {
  const benefitMentions = collectBenefits(text, ctx, diagnostics);
  const sideEffectMentions = collectSideEffects(text, ctx, diagnostics);
  const protocolMentions = collectProtocols(text, ctx, diagnostics);
  const stackMentions = collectStacks(text, diagnostics);

  const nt = normText(text);
  const pos = POSITIVE_SENTIMENT_TERMS.some((k) => nt.includes(normText(k)));
  const negPhrase =
    NEGATIVE_SENTIMENT_TERMS.some((k) => nt.includes(normText(k))) ||
    /\b(i stopped|quit taking|refund|returned it)\b/i.test(text);
  const falseNegSide = /\b(minimal|minor|no serious|no significant)\b.*\bside effects?\b/i.test(
    text
  );
  const neg = negPhrase && !falseNegSide;
  let stance: StructuredExtraction['stance'] = 'unclear';
  if (pos && !neg) stance = 'positive';
  else if (neg && !pos) stance = 'negative';
  else if (pos && neg) stance = 'mixed';

  const { age, sex } = extractDemographics(text);
  const hearsay =
    /\b(my friend|a friend|read that|heard that|someone on|not me but)\b/i.test(text);

  return {
    stance,
    benefitMentions,
    sideEffectMentions,
    protocolMentions,
    stackMentions,
    timeToEffectMentions: [],
    repeatIntent: 'unclear',
    firstHand: /\b(i |my |me |i've|i am)\b/i.test(text),
    hearsay,
    age,
    sex,
  };
}

function extractDemographics(text: string): { age: number | null; sex: SexValue | null } {
  let age: number | null = null;
  const ageM = text.match(/\b(?:i'?m|i am|age)\s*:?\s*(\d{1,2})\b/i);
  if (ageM) {
    const n = parseInt(ageM[1]!, 10);
    if (n >= 13 && n <= 100) age = n;
  }
  let sex: SexValue | null = null;
  if (/\b(?:\d{1,2}\s*m\b|\bmale\b|\bguy\b)/i.test(text)) sex = 'male';
  else if (/\b(?:\d{1,2}\s*f\b|\bfemale\b|\bwoman\b)/i.test(text)) sex = 'female';
  return { age, sex };
}

export function isBotOrDeletedAuthor(author: string | null): boolean {
  if (author == null) return true;
  return BOT_AUTHORS.has(author.toLowerCase());
}
