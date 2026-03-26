import { Hono } from 'hono';
import { getTopicBySlugWithDiagnostics, personalizeTopic } from '../services/topicService.js';
import type { PersonalizeRequest } from '../types/topicBundle.js';
import { loadTopicCorpus } from '../corpus/topicCorpus.js';
import { isCorpusDisabled } from '../config/sampling.js';

export const topicRoutes = new Hono();

function serveMetaHeaders(
  c: { header: (name: string, value: string) => void },
  corpusEntriesBefore: string,
  bundle: import('../types/topicBundle.js').TopicBundle
) {
  c.header('Cache-Control', 'no-store, must-revalidate');
  c.header('X-Reddit-Phd-Reddit-Mode', process.env.REDDIT_MODE || 'replay');
  c.header('X-Reddit-Phd-Corpus-Disabled', isCorpusDisabled() ? '1' : '0');
  c.header('X-Reddit-Phd-Corpus-Entries-Before', corpusEntriesBefore);
  c.header('X-Reddit-Phd-Data-Retrieval-Mode', bundle.data_quality.retrieval_mode);
  c.header('X-Reddit-Phd-Taxonomy-Version', bundle.data_quality.taxonomy_version);
  c.header(
    'X-Reddit-Phd-Served-Corpus-Only',
    bundle.data_quality.retrieval_mode === 'cache' ? '1' : '0'
  );
}

topicRoutes.get('/topics/by-slug/:slug', async (c) => {
  const slug = c.req.param('slug');
  const normalized = slug.trim().toLowerCase();

  let corpusEntriesBefore = 'n/a';
  if (!isCorpusDisabled()) {
    const before = await loadTopicCorpus(normalized).catch(() => null);
    corpusEntriesBefore = before ? String(before.entries.length) : '0';
  }

  const { bundle, diagnostics } = await getTopicBySlugWithDiagnostics(slug);
  console.info('[topic-resolution]', JSON.stringify(diagnostics));
  if (!bundle) {
    c.header('Cache-Control', 'no-store, must-revalidate');
    c.header('X-Reddit-Phd-Resolution-Reason', diagnostics.reason);
    return c.json({ error: 'Topic not found or no data in current mode' }, 404);
  }

  let corpusEntriesAfter = 'n/a';
  if (!isCorpusDisabled()) {
    const after = await loadTopicCorpus(normalized).catch(() => null);
    corpusEntriesAfter = after ? String(after.entries.length) : '0';
  }

  serveMetaHeaders(c, corpusEntriesBefore, bundle);
  c.header('X-Reddit-Phd-Corpus-Entries-After', corpusEntriesAfter);
  if (!isCorpusDisabled() && corpusEntriesBefore !== 'n/a' && corpusEntriesAfter !== 'n/a') {
    const delta = Number(corpusEntriesAfter) - Number(corpusEntriesBefore);
    c.header('X-Reddit-Phd-Corpus-Entries-Delta', String(delta));
  }

  return c.json(bundle);
});

topicRoutes.get('/topics/by-slug/:slug/availability', async (c) => {
  const slug = c.req.param('slug');
  const { diagnostics } = await getTopicBySlugWithDiagnostics(slug);
  c.header('Cache-Control', 'no-store, must-revalidate');
  return c.json(diagnostics);
});

topicRoutes.post('/topics/:slug/personalize', async (c) => {
  const slug = c.req.param('slug');
  const body = (await c.req.json()) as PersonalizeRequest;
  const { bundle } = await getTopicBySlugWithDiagnostics(slug);
  if (!bundle) {
    return c.json({ error: 'Topic not found' }, 404);
  }
  const out = personalizeTopic(bundle, body);
  return c.json(out);
});
