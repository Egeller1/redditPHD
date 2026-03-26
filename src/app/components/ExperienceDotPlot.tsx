import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink } from 'lucide-react';
import type { TopicBundle, ExperiencePost, DistributionStats } from '@/types/topicBundle';

const W = 820;
const H = 500;
const PAD = { top: 30, right: 30, bottom: 55, left: 44 };
const PW = W - PAD.left - PAD.right;
const PH = H - PAD.top - PAD.bottom;
const JITTER = 28;
const GRID = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const COLUMNS = [
  { id: 'negative' as const, label: 'Negative', color: '#6b7280', xFrac: 0.18 },
  { id: 'neutral' as const, label: 'Neutral', color: '#f97316', xFrac: 0.5 },
  { id: 'positive' as const, label: 'Positive', color: '#6366f1', xFrac: 0.82 },
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

export function ExperienceDotPlot({ bundle }: { bundle: TopicBundle }) {
  const dist = bundle.distribution_stats;
  const reason = bundle.metric_eligibility.distribution_stats.reason_hidden;
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selected, setSelected] = useState<ExperiencePost | null>(null);

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
    return posts.map((p, i) => {
      const col = stats.find((c) => c.id === p.category);
      if (!col) return null;
      const jitter = (sr(i * 7 + 99) - 0.5) * JITTER * 2;
      return {
        post: p,
        cx: col.cx + jitter,
        cy: scoreY(p.score),
        color: col.color,
      };
    }).filter(Boolean) as Array<{ post: ExperiencePost; cx: number; cy: number; color: string }>;
  }, [posts, stats, dist]);

  if (!dist) {
    return (
      <div className="bg-[#111111] rounded-xl p-8 border border-[#1f1f1f] mb-16">
        <h3 className="text-[18px] font-semibold text-white mb-2">Experience distribution</h3>
        <p className="text-[14px] text-[#6b7280]">
          {reason ?? 'Distribution graphic is hidden until bucket statistics are stable enough for this sample.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#111111] rounded-xl p-8 border border-[#1f1f1f] mb-16">
      <div className="mb-6">
        <h3 className="text-[18px] font-semibold text-white mb-2">Experience distribution</h3>
        <p className="text-[14px] text-[#a1a1a1]">
          {posts.length} analyzed posts in this response, placed by pipeline category (scores 0–10). Lines show mean and
          quartiles per bucket when available.
        </p>
      </div>

      <div className="relative bg-[#0a0a0a] rounded-xl border border-[#1f1f1f]/50 overflow-hidden">
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
          {GRID.map((v) => (
            <line
              key={v}
              x1={PAD.left}
              x2={W - PAD.right}
              y1={scoreY(v)}
              y2={scoreY(v)}
              stroke="#1f1f1f"
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
              fill="#4b5563"
              fontSize="11"
              fontFamily="system-ui,sans-serif"
            >
              {v}
            </text>
          ))}
          {positioned.map(({ post: p, cx, cy, color }, i) => {
            const hovered = hoveredId === p.id;
            return (
              <motion.circle
                key={p.id}
                cx={cx}
                cy={cy}
                r={hovered ? 4.5 : 3}
                fill={color}
                opacity={hovered ? 1 : 0.55}
                className="cursor-pointer"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: hovered ? 1 : 0.55, scale: 1 }}
                transition={{ delay: i * 0.02, duration: 0.2 }}
                onMouseEnter={() => setHoveredId(p.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setSelected(p)}
              />
            );
          })}
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
          {stats.map((col) => (
            <text
              key={`lbl-${col.id}`}
              x={col.cx}
              y={H - 12}
              textAnchor="middle"
              fill="#9ca3af"
              fontSize="12"
              fontFamily="system-ui,sans-serif"
            >
              {col.label}
            </text>
          ))}
        </svg>

        <AnimatePresence>
          {hoveredId && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.12 }}
              className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-[#18181b] text-white px-3 py-2 rounded-lg shadow-lg text-[12px] whitespace-nowrap pointer-events-none border border-[#2f2f2f]"
            >
              {(() => {
                const p = posts.find((x) => x.id === hoveredId);
                if (!p) return null;
                return (
                  <>
                    <div className="font-medium mb-0.5">{p.username ? `u/${p.username}` : 'Unknown'}</div>
                    <div className="text-[#a1a1aa]">
                      {p.score}/10 · {formatAgo(p.timestamp_utc)}
                    </div>
                  </>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-[#1f1f1f] text-[13px] text-[#a1a1a1]">
        {COLUMNS.map((col) => (
          <div key={col.id} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
            <span>{col.label}</span>
          </div>
        ))}
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
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[500px] bg-[#111111] border border-[#1f1f1f] rounded-2xl shadow-2xl z-50 p-8"
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
                  className="w-8 h-8 rounded-lg hover:bg-[#1f1f1f] flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-[#a1a1a1]" />
                </button>
              </div>
              <div className="bg-[#0a0a0a] rounded-xl p-6 mb-6 border border-[#1f1f1f]">
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
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg transition-colors text-[14px] font-medium"
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
