/**
 * Quality gates for topic bundles — run after `emit:bundle` or against live GET.
 * Usage: REDDIT_MODE=replay npx tsx scripts/verify-quality.ts
 */
process.env.REDDIT_MODE = 'replay';

import type { TopicBundle } from '../src/types/topicBundle.js';

const { getTopicBySlug } = await import('../src/services/topicService.js');
const { THRESHOLDS } = await import('../src/config/thresholds.js');

const FORBIDDEN_SUMMARY = [
  'pipeline',
  'pipeline-derived',
  'scored experience units',
  'debug',
];

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`VERIFY FAILED: ${msg}`);
}

function verifyBundle(b: TopicBundle) {
  const json = JSON.stringify(b);
  assert(!json.includes('support_count'), 'Old field support_count must not appear');
  assert(b.experience_score_definition.length > 20, 'experience_score_definition must be set');
  assert(b.data_quality?.retrieval_mode === 'replay', 'data_quality.retrieval_mode');
  assert(b.data_quality?.scoring_version?.length, 'data_quality.scoring_version');

  const { consensus, representative_posts, metric_eligibility, distribution_stats, low_data_warning } =
    b;

  for (const w of FORBIDDEN_SUMMARY) {
    assert(
      !consensus.summary_text.toLowerCase().includes(w),
      `summary_text must not contain "${w}"`
    );
  }

  const distShown = metric_eligibility.distribution_stats.shown;
  assert(
    distShown === (distribution_stats !== null),
    'distribution_stats must be non-null iff metric_eligibility.distribution_stats.shown'
  );

  if (b.topic.analyzed_unit_count <= THRESHOLDS.lowDataWarningMaxUnits) {
    assert(
      low_data_warning != null && low_data_warning.length > 0,
      'low_data_warning required for small corpora'
    );
  }

  if (representative_posts.positive) {
    const p = representative_posts.positive;
    assert(p.score >= THRESHOLDS.repPositiveMinScore, `positive rep score ${p.score} < min`);
    assert('reddit_score' in p && !('support_count' in p), 'representative must use reddit_score');
  }
  if (representative_posts.negative) {
    const n = representative_posts.negative;
    assert(n.score <= THRESHOLDS.repNegativeMaxScore, `negative rep score ${n.score} > max`);
  }

  for (const list of [b.insights.benefits, b.insights.side_effects]) {
    const seen = new Set<string>();
    for (const x of list) {
      const k = x.name.toLowerCase();
      assert(!seen.has(k), `Duplicate insight label in list: ${x.name}`);
      seen.add(k);
    }
  }

  console.log('verify-quality: OK', {
    slug: b.topic.slug,
    units: b.topic.analyzed_unit_count,
    distNull: distribution_stats === null,
    distShown,
    positiveRep: representative_posts.positive?.id,
    negativeRep: representative_posts.negative?.id,
  });
}

const bundle = await getTopicBySlug('creatine');
assert(!!bundle, 'creatine bundle missing');
verifyBundle(bundle);
console.log('All checks passed.');
