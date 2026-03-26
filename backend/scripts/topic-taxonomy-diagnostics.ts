/**
 * Per-topic taxonomy stdout report.
 * Usage: TOPIC_TAXONOMY_DIAGNOSTICS=1 CORPUS_DISABLED=1 REDDIT_MODE=replay npx tsx scripts/topic-taxonomy-diagnostics.ts creatine
 */
const slug = process.argv[2] || 'creatine';
process.env.TOPIC_TAXONOMY_DIAGNOSTICS = '1';

const { getTopicBySlug } = await import('../src/services/topicService.js');
const bundle = await getTopicBySlug(slug);
if (!bundle) {
  console.error('No bundle for', slug);
  process.exit(1);
}
console.log('Final top benefits:', bundle.insights.benefits.slice(0, 8));
console.log('Final top sides:', bundle.insights.side_effects.slice(0, 8));
