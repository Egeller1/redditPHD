import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { topicRoutes } from './api/routes.js';

const app = new Hono();

app.use(
  '/*',
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    exposeHeaders: [
      'X-Reddit-Phd-Reddit-Mode',
      'X-Reddit-Phd-Corpus-Disabled',
      'X-Reddit-Phd-Corpus-Entries-Before',
      'X-Reddit-Phd-Corpus-Entries-After',
      'X-Reddit-Phd-Corpus-Entries-Delta',
      'X-Reddit-Phd-Data-Retrieval-Mode',
      'X-Reddit-Phd-Taxonomy-Version',
      'X-Reddit-Phd-Served-Corpus-Only',
      'X-Reddit-Phd-Resolution-Reason',
      'Cache-Control',
    ],
  })
);

app.get('/health', (c) => c.json({ ok: true }));

app.route('/', topicRoutes);

const port = Number(process.env.PORT || 8787);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`reddit-phd-backend listening on http://localhost:${info.port}`);
  console.log(`  REDDIT_MODE=${process.env.REDDIT_MODE || 'replay'}`);
  if (process.env.CORPUS_DISABLED === '1' || process.env.CORPUS_DISABLED === 'true') {
    console.log('  CORPUS_DISABLED=1 (no data/corpus merge)');
  }
});
