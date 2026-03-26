/**
 * Shows corpus + dedupe behavior for creatine: baseline (no corpus) vs accumulated corpus + extra posts.
 * Usage: npx tsx scripts/sample-growth-demo.ts
 */
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RawRedditUnit } from '../src/types/internal.js';
import {
  finalizeCorpusEntries,
  mergeAndUpsertCorpus,
  loadTopicCorpus,
  saveTopicCorpus,
  topicCorpusPath,
} from '../src/corpus/topicCorpus.js';
import { THRESHOLDS } from '../src/config/thresholds.js';
import { SAMPLING } from '../src/config/sampling.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_CORPUS = join(__dirname, '../data/corpus');

function synthPosts(startIdx: number, n: number): RawRedditUnit[] {
  const templates = [
    (k: number) =>
      `Month ${k} update: switched to micronized powder dissolved in juice. Track cycling power on Peloton - sustained watts up about three percent. No scale jump. Sleep stayed unchanged. I am a 40-year-old recreational athlete.`,
    (k: number) =>
      `I do Olympic weightlifting twice weekly. Sodium concern pushed me to drink more electrolytes with 3g creatine rather than a full five. Snatch stability feels better; knees are happier. Partner noticed less quad fatigue.`,
    (k: number) =>
      `Vegetarian diet - I treat this as cheap insurance for phosphocreatine stores. Cognitive benefits are subtle; main win is one extra rep on heavy Romanian deadlifts. I avoid taking it late because mild insomnia once.`,
    (k: number) =>
      `Postpartum return to training: physician cleared 3g daily. Milk supply looked unaffected; hydration mattered more than timing. Hip thrust numbers climbed faster than expected, though sample is just me.`,
    (k: number) =>
      `Competitive swimmer here. Fifty-meter sprint repeats improved after four weeks. Some GI rumbling the first ten days, resolved with smaller divided doses. I still prefer morning doses before pool work.`,
    (k: number) =>
      `Traveling consultant - single-serving packets saved adherence. Hotel gym bench stayed flat but endurance on long walking days felt easier. No meaningful blood pressure change on home cuff readings.`,
    (k: number) =>
      `Older lifter (52) worried about kidney noise online. Labs before and after three months showed stable eGFR. Subjectively, lockout strength on overhead press improved without shoulder crankiness.`,
    (k: number) =>
      `Vegan stack with beta-alanine on heavy days. Loading phase was messy so I skipped it. Hamstring pull recovery timeline felt shorter versus prior injuries - could be placebo, still worth keeping.`,
    (k: number) =>
      `Student budget: cheapest monohydrate from warehouse store. Dissolves poorly but effective. Exam weeks had less brain fog when sleep was trash; grain of salt anecdote tied to exam stress.`,
    (k: number) =>
      `Type-1 diabetic - endo said okay with hydration monitoring. CGM variability unchanged; bolus strategy same. Lifting volume tolerated better on high-carb training days.`,
    (k: number) =>
      `Cut phase: water weight scared me week one. Waist measurements normalized; strength retained better than prior cuts without creatine. Hunger stayed worse than baseline, unrelated maybe.`,
    (k: number) =>
      `Jiu-jitsu hobbyist - more rounds before grip gave out. No cramping once magnesium plus electrolytes were consistent. Acne flared one week then settled; skeptical it was creatine alone.`,
    (k: number) =>
      `I do time-restricted eating; take creatine with first meal. Squat triples moved from RPE 9 to RPE 8 at same weight. Heartburn once if taken dry - now always mix thoroughly.`,
    (k: number) =>
      `Hiking fourteeners - less burning in calves on descent. Altitude sickness unchanged. Probably marginal benefit for endurance sports versus strength, but cheap enough to keep.`,
  ];
  const out: RawRedditUnit[] = [];
  for (let i = 0; i < n; i++) {
    const idx = startIdx + i;
    const tpl = templates[(idx - 1) % templates.length]!;
    const body = tpl(idx);
    const subs = ['supplements', 'bodybuilding', 'powerlifting', 'running', 'naturalbodybuilding'];
    const sub = subs[idx % subs.length] ?? 'supplements';
    out.push({
      kind: 'post',
      id: `demopost${idx}`,
      name: `t3_demopost${idx}`,
      threadId: `t3_demopost${idx}`,
      subreddit: sub,
      author: `user_${idx}`,
      created_utc: 1_700_000_000 + idx * 3600,
      score: 4 + (idx % 8),
      permalink: `/r/${sub}/comments/demopost${idx}/creatine_n_${idx}/`,
      title: `Creatine thread ${idx}: different context so dedupe stays honest`,
      body,
    });
  }
  return out;
}

async function main() {
  process.env.REDDIT_MODE = 'replay';
  process.env.CORPUS_DIAGNOSTICS = '1';
  const slug = 'creatine';

  await rm(DATA_CORPUS, { recursive: true, force: true }).catch(() => {});
  await mkdir(DATA_CORPUS, { recursive: true });

  process.env.CORPUS_DISABLED = '1';
  const { getTopicBySlug: getA } = await import('../src/services/topicService.js');
  const before = await getA(slug);
  if (!before) throw new Error('before bundle missing');

  delete process.env.CORPUS_DISABLED;

  const { getTopicBySlug: getB } = await import('../src/services/topicService.js');
  const mid = await getB(slug);
  if (!mid) throw new Error('mid bundle missing');

  const now = new Date().toISOString();
  const stored = (await loadTopicCorpus(slug))!;
  const extra = synthPosts(1, 20).map((raw) => ({ raw, mode: 'replay' as const }));
  const { entries: up, stats: base } = mergeAndUpsertCorpus(stored.entries, extra, now);
  const { entries: fin } = finalizeCorpusEntries(
    up,
    base,
    THRESHOLDS.dedupJaccard,
    SAMPLING.maxCorpusEntries
  );
  await saveTopicCorpus({ version: 1, slug, updated_at: now, entries: fin });

  const { getTopicBySlug: getC } = await import('../src/services/topicService.js');
  const after = await getC(slug);
  if (!after) throw new Error('after bundle missing');

  const summary = {
    before: {
      analyzed_unit_count: before.topic.analyzed_unit_count,
      analyzed_thread_count: before.topic.analyzed_thread_count,
      sample_strength: before.data_quality.sample_strength,
      consensus_confidence: before.consensus.confidence,
      retrieval_mode: before.data_quality.retrieval_mode,
    },
    after_corpus_seed_replay: {
      analyzed_unit_count: mid.topic.analyzed_unit_count,
      analyzed_thread_count: mid.topic.analyzed_thread_count,
      sample_strength: mid.data_quality.sample_strength,
      consensus_confidence: mid.consensus.confidence,
      retrieval_mode: mid.data_quality.retrieval_mode,
    },
    after_synthetic_accumulation: {
      analyzed_unit_count: after.topic.analyzed_unit_count,
      analyzed_thread_count: after.topic.analyzed_thread_count,
      sample_strength: after.data_quality.sample_strength,
      consensus_confidence: after.consensus.confidence,
      retrieval_mode: after.data_quality.retrieval_mode,
      low_data_warning: after.low_data_warning,
    },
    corpus_file: topicCorpusPath(slug),
  };

  console.log('\n=== sample-growth-demo (creatine) ===\n');
  console.log(JSON.stringify(summary, null, 2));
  console.log('\n=== final TopicBundle JSON ===\n');
  console.log(JSON.stringify(after, null, 2));

  await writeFile(
    join(__dirname, '../data/sample-growth-demo-output.json'),
    JSON.stringify({ summary, bundle: after }, null, 2),
    'utf-8'
  );
  console.log('\nWrote data/sample-growth-demo-output.json');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
