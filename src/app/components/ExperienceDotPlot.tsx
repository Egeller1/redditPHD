import React, { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink } from 'lucide-react';
import type { TopicBundle, ExperiencePost, DistributionStats } from '@/types/topicBundle';

const W = 820;
const H = 500;
const PAD = { top: 30, right: 14, bottom: 55, left: 20 };
const PW = W - PAD.left - PAD.right;
const PH = H - PAD.top - PAD.bottom;
const JITTER_X = 52;
const JITTER_Y = 16;
const GRID = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const COLUMNS = [
  { id: 'negative' as const, label: 'Negative', color: '#6b7280', xFrac: 0.16 },
  { id: 'neutral' as const, label: 'Neutral', color: '#f97316', xFrac: 0.5 },
  { id: 'positive' as const, label: 'Positive', color: '#6366f1', xFrac: 0.84 },
];

const colX = (frac: number) => PAD.left + PW * frac;
const scoreY = (s: number) => PAD.top + PH - (s / 10) * PH;

function sr(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function formatAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return iso;
  const d = Math.max(0, Date.now() - t);
  const day = 86400000;
  if (d < day) return 'Today';
  if (d < 14 * day) return `${Math.round(d / day)}d ago`;
  if (d < 60 * day) return `${Math.round(d / (7 * day))}w ago`;
  return `${Math.round(d / (30 * day))}mo ago`;
}

function bucketLines(dist: DistributionStats, id: 'negative' | 'neutral' | 'positive') {
  const b = dist[id];
  return { mean: b.mean, p25: b.p25, p75: b.p75 };
}

interface HoveredDot {
  post: ExperiencePost;
  svgX: number;
  svgY: number;
}

export function ExperienceDotPlot({ bundle }: { bundle: TopicBundle }) {
  const dist = bundle.distribution_stats;
  const reason = bundle.metric_eligibility.distribution_stats.reason_hidden;
  const [hovered, setHovered] = useState<HoveredDot | null>(null);
  const [selected, setSelected] = useState<ExperiencePost | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const posts = bundle.experience_posts;
  const stats = useMemo(() => {
    if (!dist) return [];
    return COLUMNS.map((col) => {
      const { mean, p25, p75 } = bucketLines(dist, col.id);
      return { ...col, mean, p25, p75, cx: colX(col.xFrac) };
    });
  }, [dist]);

  const positioned = useMemo(() => {
    if (!dist) return [];
    return posts.map((post: ExperiencePost, i: number) => {
      const col = stats.find((c) => c.id === post.category);
      if (!col) return null;
      const jitterX = (sr(i * 7 + 99) - 0.5) * JITTER_X * 2;
      const jitterY = (sr(i * 13 + 5) - 0.5) * JITTER_Y * 2;
      return {
        post,
        cx: Math.max(PAD.left + 6, Math.min(W - PAD.right - 6, col.cx + jitterX)),
        cy: Math.max(PAD.top + 4, Math.min(H - PAD.bottom - 4, scoreY(post.score) + jitterY)),
        color: col.color,
      };
    }).filter(Boolean) as Array<{ post: ExperiencePost; cx: number; cy: number; color: string }>;
  }, [posts, stats, dist]);

  // Expected score marker — use consensus data
  const expectedScore = bundle.consensus?.expected_score ?? null;
  const sampleSize = bundle.consensus?.sample_size ?? null;

  const handleMouseEnter = useCallback((dot: { post: ExperiencePost; cx: number; cy: number }) => {
    setHovered({ post: dot.post, svgX: dot.cx, svgY: dot.cy });
  }, []);

  if (!dist) {
    return (
      <div className="bg-[#0c1410] rounded-xl p-8 border border-[#1e2d1f]/60 mb-16">
        <h3 className="text-[18px] font-semibold text-white mb-2">Experience distribution</h3>
        <p className="text-[14px] text-[#6b7280]">
          {reason ?? 'Distribution graphic is hidden until bucket statistics are stable enough for this sample.'}
        </p>
      </div>
    );
  }

  // Tooltip positioning: keep it inside the SVG viewport (0..W x 0..H)
  const tipW = 200;
  const tipH = 80;
  const tipX = hovered
    ? hovered.svgX + 14 + tipW > W - PAD.right
      ? hovered.svgX - 14 - tipW
      : hovered.svgX + 14
    : 0;
  const tipY = hovered
    ? Math.max(PAD.top, Math.min(H - PAD.bottom - tipH, hovered.svgY - tipH / 2))
    : 0;

  return (
    <div className="bg-[#0c1410] rounded-xl p-8 border border-[#1e2d1f]/60 mb-16">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] text-[#6b7280] uppercase tracking-[0.1em] font-medium mb-1">
            Experience Distribution
          </p>
          <p className="text-[11px] text-[#4b5563] mt-0.5">
            Density of Reddit posts · 0 = negative · 10 = positive
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-[#4b5563]">Low</span>
          <div
            className="w-20 h-[5px] rounded-full"
            style={{ background: 'linear-gradient(to right, #08104a, #1a3aaf, #6014aa, #c41230, #e85d04, #ffd166)' }}
          />
          <span className="text-[10px] text-[#4b5563]">High</span>
        </div>
      </div>
      <div className="mb-6">
        <p className="text-[14px] text-[#a1a1a1]">Each data point represents one person experience.</p>
      </div>

      <div className="relative bg-[#080c09] rounded-xl border border-[#1e2d1f]/60 overflow-hidden">
        <svg
          ref={svgRef}
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => setHovered(null)}
        >
          {/* Grid lines */}
          {GRID.map((v) => (
            <line
              key={v}
              x1={PAD.left}
              x2={W - PAD.right}
              y1={scoreY(v)}
              y2={scoreY(v)}
              stroke="#202028"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}
          {[0, 2, 4, 6, 8, 10].map((v) => (
            <text
              key={v}
              x={PAD.left - 8}
              y={scoreY(v) + 4}
              textAnchor="end"
              fill="#52525b"
              fontSize="11"
              fontFamily="system-ui,sans-serif"
            >
              {v}
            </text>
          ))}

          {/* Dots */}
          {positioned.map(({ post: p, cx, cy, color }, i) => {
            const isHovered = hovered?.post.id === p.id;
            return (
              <motion.circle
                key={p.id}
                cx={cx}
                cy={cy}
                r={isHovered ? 5 : 3}
                fill={color}
                opacity={isHovered ? 1 : 0.55}
                className="cursor-pointer"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: isHovered ? 1 : 0.55, scale: 1 }}
                transition={{ delay: i * 0.02, duration: 0.2 }}
                onMouseEnter={() => handleMouseEnter({ post: p, cx, cy })}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(p)}
              />
            );
          })}

          {/* Stat lines */}
          {stats.map((col) => (
            <g key={`stat-${col.id}`}>
              <line
                x1={col.cx - 38}
                x2={col.cx + 38}
                y1={scoreY(col.p25)}
                y2={scoreY(col.p25)}
                stroke={col.color}
                strokeWidth="1.5"
                opacity={0.45}
              />
              <line
                x1={col.cx - 38}
                x2={col.cx + 38}
                y1={scoreY(col.p75)}
                y2={scoreY(col.p75)}
                stroke={col.color}
                strokeWidth="1.5"
                opacity={0.45}
              />
              <line
                x1={col.cx - 50}
                x2={col.cx + 50}
                y1={scoreY(col.mean)}
                y2={scoreY(col.mean)}
                stroke={col.color}
                strokeWidth="2.5"
                opacity={0.9}
              />
            </g>
          ))}

          {/* Column labels */}
          {stats.map((col) => (
            <text
              key={`lbl-${col.id}`}
              x={col.cx}
              y={H - 12}
              textAnchor="middle"
              fill="#6b7280"
              fontSize="12"
              fontFamily="system-ui,sans-serif"
            >
              {col.label}
            </text>
          ))}

          {/* Expected score marker */}
          {expectedScore != null && (() => {
            const mx = W / 2;
            const my = scoreY(expectedScore);
            // Label pinned near top of chart
            const labelY = PAD.top + 2;
            const arrowTop = labelY + 28;
            return (
              <g>
                {/* Glow rings */}
                <circle cx={mx} cy={my} r={18} fill="#14b8a6" opacity={0.08} />
                <circle cx={mx} cy={my} r={12} fill="#14b8a6" opacity={0.15} />
                {/* Main dot */}
                <circle cx={mx} cy={my} r={7} fill="#14b8a6" opacity={0.95} />
                {/* Vertical line from dot up to label */}
                <line
                  x1={mx} x2={mx}
                  y1={my - 9} y2={arrowTop + 7}
                  stroke="#14b8a6" strokeWidth="1.5" opacity={0.6}
                  strokeDasharray="3 3"
                />
                {/* Arrowhead at dot end */}
                <polygon
                  points={`${mx},${my - 9} ${mx - 4},${my - 17} ${mx + 4},${my - 17}`}
                  fill="#14b8a6" opacity={0.75}
                />
                {/* Label — plain text, no box */}
                <text
                  x={mx}
                  y={labelY + 16}
                  textAnchor="middle"
                  fill="#5eead4"
                  fontSize="12"
                  fontFamily="system-ui,sans-serif"
                  fontWeight="600"
                  letterSpacing="0.02em"
                >
                  Expected Experience · {expectedScore.toFixed(1)}/10{sampleSize ? ` · ${sampleSize} posts` : ''}
                </text>
              </g>
            );
          })()}

          {/* Hover tooltip rendered inside SVG as foreignObject for rich text */}
          {hovered && (
            <foreignObject
              x={tipX}
              y={tipY}
              width={tipW}
              height={tipH + 20}
              style={{ pointerEvents: 'none' }}
            >
              <div
                // @ts-ignore
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  background: '#111f14',
                  border: '1px solid #2f2f2f',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: 'white',
                  fontSize: '12px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                  maxWidth: `${tipW}px`,
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '2px' }}>
                  {hovered.post.username ? `u/${hovered.post.username}` : 'Unknown'}
                </div>
                <div style={{ color: '#a1a1aa', marginBottom: '4px' }}>
                  {hovered.post.score}/10 · {formatAgo(hovered.post.timestamp_utc)}
                </div>
                {hovered.post.excerpt && (
                  <div style={{ color: '#d4d4d8', fontSize: '11px', lineHeight: '1.4', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {hovered.post.excerpt}
                  </div>
                )}
              </div>
            </foreignObject>
          )}
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-[#1e2d1f] text-[13px] text-[#a1a1a1]">
        {COLUMNS.map((col) => (
          <div key={col.id} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
            <span>{col.label}</span>
          </div>
        ))}
        {expectedScore != null && (
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#14b8a6' }} />
            <span>Expected Experience</span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[500px] bg-[#0f1612] border border-[#1e2d1f] rounded-2xl shadow-2xl z-50 p-8"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-[18px] font-semibold text-white">Score {selected.score}/10</h3>
                  <p className="text-[13px] text-[#a1a1a1]">
                    {selected.username ? `u/${selected.username}` : 'Unknown'} · {formatAgo(selected.timestamp_utc)} · r/
                    {selected.subreddit}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-lg hover:bg-[#1e2d1f] flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-[#a1a1a1]" />
                </button>
              </div>
              <div className="bg-[#080c09] rounded-xl p-6 mb-6 border border-[#1e2d1f]">
                <p className="text-[15px] text-[#e5e5e5] leading-[1.7] mb-4">{selected.excerpt}</p>
                {(selected.age != null || selected.sex != null) && (
                  <div className="flex items-center gap-4 text-[13px] text-[#a1a1a1]">
                    {selected.age != null && <span>Age: {selected.age}</span>}
                    {selected.sex != null && <span>Sex: {selected.sex}</span>}
                  </div>
                )}
              </div>
              <a
                href={selected.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#14b8a6] hover:bg-[#0d9488] text-white rounded-lg transition-colors text-[14px] font-medium"
              >
                <span>View on Reddit</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
