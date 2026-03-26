/**
 * Integration test against a running server (must match current code — restart after edits).
 * Usage: CORPUS_DISABLED=1 REDDIT_MODE=replay npm run dev   # terminal 1
 *        BASE_URL=http://localhost:8787 npm run test:http
 */
const base = process.env.BASE_URL || 'http://127.0.0.1:8787';

const THRESHOLDS = {
  repPositiveMinScore: 7.5,
  repNegativeMaxScore: 3.5,
  lowDataWarningMaxUnits: 18,
} as const;

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

async function main() {
  const r = await fetch(`${base}/topics/by-slug/creatine`);
  assert(r.ok, `GET /topics/by-slug/creatine → ${r.status}`);
  const b = (await r.json()) as Record<string, unknown>;

  const json = JSON.stringify(b);
  assert(!json.includes('support_count'), 'Old field support_count must not appear');

  const consensus = b.consensus as { summary_text: string };
  const s = consensus.summary_text.toLowerCase();
  for (const w of ['pipeline', 'pipeline-derived', 'scored experience units', 'debug']) {
    assert(!s.includes(w), `summary must not contain "${w}"`);
  }

  assert(
    typeof b.experience_score_definition === 'string' &&
      (b.experience_score_definition as string).length > 20,
    'experience_score_definition required'
  );

  const me = b.metric_eligibility as { distribution_stats: { shown: boolean } };
  const distShown = me.distribution_stats.shown;
  assert(
    distShown === (b.distribution_stats != null),
    'distribution_stats must be non-null iff metric_eligibility.distribution_stats.shown'
  );

  const topic = b.topic as { analyzed_unit_count: number };
  if (topic.analyzed_unit_count <= THRESHOLDS.lowDataWarningMaxUnits) {
    assert(
      typeof b.low_data_warning === 'string' && (b.low_data_warning as string).length > 0,
      'low_data_warning required for small corpora'
    );
  }

  const reps = b.representative_posts as {
    positive: { score: number; reddit_score: unknown } | null;
    negative: { score: number } | null;
  };
  assert(reps.positive && reps.positive.score >= THRESHOLDS.repPositiveMinScore, 'positive rep score floor');
  assert(reps.negative && reps.negative.score <= THRESHOLDS.repNegativeMaxScore, 'negative rep score ceiling');
  assert('reddit_score' in (reps.positive || {}), 'positive rep must have reddit_score');

  const insights = b.insights as { benefits: { name: string }[]; side_effects: { name: string }[] };
  for (const vague of ['gains', 'muscle']) {
    assert(
      !insights.benefits.some((x) => x.name.toLowerCase() === vague),
      `vague benefit label "${vague}" should not appear`
    );
  }
  assert(
    !insights.side_effects.some((x) => x.name.toLowerCase() === 'stomach'),
    'vague stomach label should not appear'
  );
  const sideNames = insights.side_effects.map((x) => x.name);
  assert(
    !(sideNames.includes('bloat') && sideNames.includes('bloating')),
    'bloat and bloating should be merged to one canonical label'
  );

  if (b.experience_posts) {
    const posts = b.experience_posts as { id: string; score: number; category: string }[];
    const p4 = posts.find((p) => p.id === 't3_p4');
    if (p4) {
      assert(
        p4.score < 6.5 && p4.category === 'neutral',
        `nootropic-style t3_p4 should be neutral (score < 6.5); got ${p4.score}, ${p4.category}`
      );
    }
  }

  const pr = await fetch(`${base}/topics/creatine/personalize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ age: 30, sex: 'male' }),
  });
  assert(pr.ok, `POST personalize → ${pr.status}`);
  const body = (await pr.json()) as { consensus: unknown; personalization_note: string | null };
  assert(body.consensus != null, 'personalize response must include consensus');
  assert(typeof body.personalization_note === 'string' || body.personalization_note === null, 'note');

  const dq = b.data_quality as { retrieval_mode: string; scoring_version: string } | undefined;
  assert(dq?.retrieval_mode === 'replay', 'data_quality.retrieval_mode should match server mode');
  assert(typeof dq?.scoring_version === 'string' && dq.scoring_version.length > 0, 'scoring_version');

  console.log('HTTP endpoint tests: OK', { base });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
