import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { SearchSection } from '../components/SearchSection';
import { ConsensusCard } from '../components/ConsensusCard';
import { ExperienceCards } from '../components/ExperienceCards';
import { InsightsGrid } from '../components/InsightsGrid';
import { ExperienceDotPlot } from '../components/ExperienceDotPlot';
import { fetchTopicBundle } from '@/lib/topicApi';
import { queryParamToSlug } from '@/lib/slug';
import type { TopicBundle } from '@/types/topicBundle';

function RetrievalHint({ bundle }: { bundle: TopicBundle }) {
  const mode = bundle.data_quality.retrieval_mode;
  const labels: Record<string, string> = {
    live: 'Live Reddit retrieval (this run hit the network).',
    replay: 'Replay fixture — same snapshot each time; not live Reddit.',
    cache: 'Persisted corpus only — no fetch this request (may include earlier live/replay rows).',
    fixture: 'Pre-baked bundle file — static demo artifact.',
  };
  return (
    <div className="mb-8 rounded-lg border border-[#2a2a2a] bg-[#141414] px-4 py-2 text-left">
      <p className="text-[11px] font-mono text-[#737373]">
        <span className="text-[#a3a3a3]">source</span>{' '}
        <span className="text-[#c4b5fd]">{mode}</span>
        <span className="text-[#525252]"> · </span>
        {labels[mode] ?? mode}
        <span className="text-[#525252]"> · </span>
        <span className="text-[#525252]">
          scoring {bundle.data_quality.scoring_version} · taxonomy {bundle.data_quality.taxonomy_version}
        </span>
      </p>
    </div>
  );
}

export function Results() {
  const params = useParams();
  const rawQuery = params.query ?? '';
  const slug = queryParamToSlug(decodeURIComponent(rawQuery));
  const [bundle, setBundle] = useState<TopicBundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const searchInitial = slug ? slug.replace(/-/g, ' ') : '';

  useEffect(() => {
    let cancel = false;
    if (!slug) {
      setLoading(false);
      setError('Invalid search');
      setBundle(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetchTopicBundle(slug)
      .then(({ bundle: b, meta }) => {
        if (!cancel) {
          if (slug === 'creatine' && import.meta.env.DEV) {
            console.info(
              '[reddit-phd][creatine] exact TopicBundle JSON from this fetch:',
              JSON.stringify(b, null, 2)
            );
            console.info('[reddit-phd][creatine] fetch audit', {
              requestUrl: meta.requestUrl,
              fetchMode: meta.fetchMode,
              viteApiUrl: meta.viteApiUrl ?? '(unset — using Vite /api proxy)',
              status: meta.status,
              responseHeaders: meta.responseHeaders,
              retrieval_mode: b.data_quality.retrieval_mode,
              taxonomy_version: b.data_quality.taxonomy_version,
            });
          }
          setBundle(b);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancel) {
          setBundle(null);
          setError(err instanceof Error ? err.message : 'Failed to load topic');
        }
      })
      .finally(() => {
        if (!cancel) setLoading(false);
      });
    return () => {
      cancel = true;
    };
  }, [slug]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <main className="max-w-[1400px] mx-auto px-8 py-12">
        <div className="mb-12">
          <SearchSection initialInput={searchInitial} topicHint={searchInitial} />
        </div>

        {loading && (
          <p className="text-[15px] text-[#a1a1a1] mb-8">Loading topic…</p>
        )}

        {error && (
          <div className="mb-8 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-[14px] text-red-200">
            <p className="font-medium mb-1">Could not load this topic</p>
            <p className="text-red-200/80">{error}</p>
            <p className="text-[13px] text-[#a1a1a1] mt-2">
              For slug <code className="text-[#e5e5e5]">{slug || '—'}</code>; start the backend with{' '}
              <code className="text-[#e5e5e5]">REDDIT_MODE=live</code> if there is no replay fixture.
            </p>
          </div>
        )}

        {bundle && (
          <>
            <RetrievalHint bundle={bundle} />

            {bundle.low_data_warning && (
              <div className="mb-8 rounded-xl border border-amber-500/40 bg-amber-500/15 px-5 py-4 text-[14px] text-amber-50">
                <p className="font-semibold text-amber-200 mb-1">Thin sample</p>
                <p className="text-[#fde68a]/95 leading-relaxed">{bundle.low_data_warning}</p>
              </div>
            )}

            <div className="mb-8">
              <h1 className="text-[32px] font-semibold text-white tracking-[-0.02em] mb-2">
                {bundle.topic.display_name}
              </h1>
              <p className="text-[15px] text-[#a1a1a1]">
                Analyzed {bundle.topic.analyzed_unit_count} quality-filtered posts/comments ·{' '}
                {bundle.topic.analyzed_thread_count} threads · {bundle.topic.subreddit_count} subreddits · sample strength{' '}
                <span className="text-white">{bundle.data_quality.sample_strength}</span>
              </p>
            </div>

            <ConsensusCard bundle={bundle} />
            <ExperienceDotPlot bundle={bundle} />
            <ExperienceCards bundle={bundle} />
            <InsightsGrid bundle={bundle} />
          </>
        )}
      </main>
    </div>
  );
}
