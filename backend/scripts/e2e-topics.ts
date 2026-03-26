/**
 * In-process topic smoke for reporting. Usage:
 *   CORPUS_DISABLED=1 REDDIT_MODE=replay npx tsx scripts/e2e-topics.ts
 *   CORPUS_DISABLED=1 REDDIT_MODE=live npx tsx scripts/e2e-topics.ts
 */
const slugs = ['creatine', 'ashwagandha', 'caffeine', 'intermittent-fasting', 'cold-showers'];

async function main() {
  const { getTopicBySlug } = await import('../src/services/topicService.js');
  const out: unknown[] = [];
  for (const slug of slugs) {
    const bundle = await getTopicBySlug(slug);
    if (!bundle) {
      out.push({ slug, error: 'null_bundle' });
      continue;
    }
    out.push({
      slug,
      analyzed_unit_count: bundle.topic.analyzed_unit_count,
      analyzed_thread_count: bundle.topic.analyzed_thread_count,
      subreddit_count: bundle.topic.subreddit_count,
      sample_strength: bundle.data_quality.sample_strength,
      retrieval_mode: bundle.data_quality.retrieval_mode,
      low_data_warning: bundle.low_data_warning != null,
      positive_rep: bundle.representative_posts.positive?.id ?? null,
      negative_rep: bundle.representative_posts.negative?.id ?? null,
      benefits_top: bundle.insights.benefits.slice(0, 4).map((b) => b.name),
      sides_top: bundle.insights.side_effects.slice(0, 4).map((s) => s.name),
      dist_shown: bundle.metric_eligibility.distribution_stats.shown,
    });
  }
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
