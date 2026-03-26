/**
 * Live availability diagnostics for topic slugs.
 *
 * Usage:
 *   npx tsx scripts/topic-availability.ts creatine caffeine
 *   npx tsx scripts/topic-availability.ts   # defaults to common demo topics
 */
const DEFAULT_SLUGS = [
  'creatine',
  'ashwagandha',
  'caffeine',
  'intermittent-fasting',
  'cold-showers',
];

const base = process.env.API_BASE_URL || 'http://127.0.0.1:8787';
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_SLUGS;

async function check(slug: string) {
  const url = `${base}/topics/by-slug/${encodeURIComponent(slug)}/availability`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    return { slug, ok: false, status: res.status, error: await res.text() };
  }
  const d = (await res.json()) as Record<string, unknown>;
  return {
    slug,
    ok: true,
    normalized_slug: d.normalized_slug,
    query_variants: d.query_variants,
    subreddits_searched: d.subreddits_searched,
    replay_available: d.replay_available,
    corpus_available: d.corpus_available,
    live_attempted: d.live_attempted,
    candidate_posts_found: d.candidate_posts_found,
    threads_fetched: d.threads_fetched,
    threads_expanded: d.threads_expanded,
    usable_units_extracted: d.usable_units_extracted,
    would_return_bundle: d.would_return_bundle,
    reason: d.reason,
    retrieval_mode: d.retrieval_mode,
    live_requests_attempted: d.live_requests_attempted,
    live_requests_succeeded: d.live_requests_succeeded,
    live_requests_failed: d.live_requests_failed,
  };
}

async function main() {
  const out = [];
  for (const slug of slugs) {
    out.push(await check(slug));
  }
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
