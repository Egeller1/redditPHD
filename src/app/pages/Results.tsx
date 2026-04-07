import { useParams } from 'react-router';
import { useEffect, useState, useCallback, useRef } from 'react';
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { PersonalizeResponse } from '@/types/topicBundle';
import { SearchSection } from '../components/SearchSection';
import { ConsensusCard, PersonalizeSection } from '../components/ConsensusCard';
import { ExperienceCards } from '../components/ExperienceCards';
import { InsightsGrid } from '../components/InsightsGrid';
import { ExperienceDotPlot } from '../components/ExperienceDotPlot';
import { BlobLoader } from '../components/BlobLoader';
import { fetchTopicBundle } from '@/lib/topicApi';
import { queryParamToSlug } from '@/lib/slug';
import type { TopicBundle } from '@/types/topicBundle';

/** Fade + slide up when section enters viewport */
function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
}

/** Slow-drifting particles layered over the static neural background */
function FloatingParticles() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: 8 + (i * 7.7) % 85,
    y: 5 + (i * 11.3) % 90,
    size: 2 + (i % 3),
    duration: 14 + (i % 7) * 3,
    delay: -(i * 2.1),
    dx: (i % 2 === 0 ? 1 : -1) * (18 + (i % 4) * 8),
    dy: (i % 3 === 0 ? 1 : -1) * (12 + (i % 5) * 6),
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: '#14b8a6',
            opacity: 0.35,
          }}
          animate={{
            x: [0, p.dx, 0, -p.dx, 0],
            y: [0, p.dy, -p.dy * 0.5, p.dy * 0.3, 0],
            opacity: [0.2, 0.5, 0.25, 0.45, 0.2],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function NeuralBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(20,184,166,0.025) 3px, rgba(20,184,166,0.025) 4px)',
      }} />
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1400 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: 0.22 }}
      >
        <defs>
          <radialGradient id="rg-node" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g>
          <line x1="80" y1="65" x2="145" y2="110" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="145" y1="110" x2="230" y2="85" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="230" y1="85" x2="310" y2="140" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="310" y1="140" x2="420" y2="95" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="145" y1="110" x2="180" y2="175" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="180" y1="175" x2="285" y2="160" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="420" y1="95" x2="520" y2="125" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="520" y1="125" x2="610" y2="90" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="610" y1="90" x2="695" y2="155" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="695" y1="155" x2="780" y2="110" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="180" y1="175" x2="120" y2="245" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="120" y1="245" x2="210" y2="280" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="210" y1="280" x2="335" y2="250" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="285" y1="160" x2="365" y2="220" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="365" y1="220" x2="460" y2="195" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="460" y1="195" x2="555" y2="240" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="555" y1="240" x2="640" y2="205" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="640" y1="205" x2="730" y2="260" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="730" y1="260" x2="820" y2="225" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="210" y1="280" x2="175" y2="350" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="175" y1="350" x2="270" y2="380" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="270" y1="380" x2="380" y2="340" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="380" y1="340" x2="490" y2="310" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="490" y1="310" x2="575" y2="365" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="575" y1="365" x2="670" y2="330" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="670" y1="330" x2="755" y2="385" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="755" y1="385" x2="850" y2="340" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="850" y1="340" x2="940" y2="120" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="940" y1="120" x2="1030" y2="175" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="1030" y1="175" x2="1120" y2="140" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="1120" y1="140" x2="1210" y2="195" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="940" y1="120" x2="920" y2="250" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="920" y1="250" x2="1015" y2="280" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="1015" y1="280" x2="1105" y2="245" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="1105" y1="245" x2="1195" y2="295" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="920" y1="250" x2="880" y2="370" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="880" y1="370" x2="970" y2="405" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="970" y1="405" x2="1065" y2="370" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="1065" y1="370" x2="1150" y2="420" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="880" y1="370" x2="860" y2="495" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="860" y1="495" x2="950" y2="530" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="950" y1="530" x2="1040" y2="495" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="1040" y1="495" x2="1130" y2="540" stroke="#14b8a6" strokeWidth="0.5" />
          {/* Extended rows for tall pages */}
          <line x1="175" y1="350" x2="100" y2="460" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="270" y1="380" x2="230" y2="520" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="380" y1="340" x2="350" y2="490" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="490" y1="310" x2="440" y2="560" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="670" y1="330" x2="620" y2="600" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="820" y1="225" x2="780" y2="650" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="1030" y1="175" x2="1060" y2="620" stroke="#14b8a6" strokeWidth="0.5" />
          <line x1="1195" y1="295" x2="1250" y2="700" stroke="#14b8a6" strokeWidth="0.5" />
        </g>
        <g>
          {[
            [80,65],[145,110],[230,85],[310,140],[420,95],[520,125],[610,90],[695,155],[780,110],
            [180,175],[120,245],[210,280],[285,160],[335,250],[365,220],[460,195],[555,240],[640,205],[730,260],[820,225],
            [175,350],[270,380],[380,340],[490,310],[575,365],[670,330],[755,385],[850,340],
            [230,465],[325,490],[435,455],[525,500],[620,470],[710,520],[800,485],
            [940,120],[1030,175],[1120,140],[1210,195],[920,250],[1015,280],[1105,245],[1195,295],
            [880,370],[970,405],[1065,370],[1150,420],[860,495],[950,530],[1040,495],[1130,540],
            [100,460],[230,520],[350,490],[440,560],[620,600],[780,650],[1060,620],[1250,700],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="2.5" fill="#14b8a6" opacity="0.8" />
          ))}
          <circle cx="460" cy="195" r="5" fill="url(#rg-node)" />
          <circle cx="460" cy="195" r="2.5" fill="#14b8a6" />
          <circle cx="670" cy="330" r="5" fill="url(#rg-node)" />
          <circle cx="670" cy="330" r="2.5" fill="#14b8a6" />
          <circle cx="1030" cy="175" r="5" fill="url(#rg-node)" />
          <circle cx="1030" cy="175" r="2.5" fill="#14b8a6" />
        </g>
      </svg>
    </div>
  );
}

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
  const [personalized, setPersonalized] = useState<PersonalizeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handlePersonalized = useCallback((r: PersonalizeResponse) => {
    setPersonalized(r);
  }, []);

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
    setPersonalized(null);
    fetchTopicBundle(slug)
      .then(({ bundle: b, meta }) => {
        if (!cancel) {
          if (slug === 'creatine' && import.meta.env.DEV) {
            console.info('[reddit-phd][creatine] exact TopicBundle JSON from this fetch:', JSON.stringify(b, null, 2));
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
    return () => { cancel = true; };
  }, [slug]);

  return (
    <div className="min-h-screen bg-[#080c09] relative">
      <BlobLoader visible={loading} minMs={2200} />
      <NeuralBackground />
      <FloatingParticles />
      <div className="relative" style={{ zIndex: 1 }}>
        <main className="max-w-[1400px] mx-auto px-8 py-12">
          <div className="mb-12">
            <SearchSection initialInput={searchInitial} topicHint={searchInitial} />
          </div>

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

          <AnimatePresence>
          {bundle && (
            <motion.div
              key={bundle.topic.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            >
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

              <FadeInSection delay={0}><ConsensusCard bundle={personalized ? { ...bundle, consensus: personalized.consensus } : bundle} /></FadeInSection>
              <FadeInSection delay={0.05}><PersonalizeSection bundle={bundle} onPersonalized={handlePersonalized} /></FadeInSection>
              <FadeInSection delay={0.1}><ExperienceDotPlot bundle={bundle} /></FadeInSection>
              <FadeInSection delay={0}><ExperienceCards bundle={bundle} /></FadeInSection>
              <FadeInSection delay={0}><InsightsGrid bundle={bundle} /></FadeInSection>
            </motion.div>
          )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
