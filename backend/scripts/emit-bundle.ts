/**
 * Regenerate `src/fixtures/creatine.bundle.json` from `creatine.replay.json`
 * Run: REDDIT_MODE=replay npx tsx scripts/emit-bundle.ts
 */
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

process.env.REDDIT_MODE = 'replay';

const __dirname = dirname(fileURLToPath(import.meta.url));

const { getTopicBySlug } = await import('../src/services/topicService.js');

const slug = process.argv[2] || 'creatine';
const bundle = await getTopicBySlug(slug);
if (!bundle) {
  console.error('No bundle produced');
  process.exit(1);
}

const out = join(__dirname, '../src/fixtures', `${slug}.bundle.json`);
await writeFile(out, JSON.stringify(bundle, null, 2), 'utf-8');
console.log('Wrote', out);
