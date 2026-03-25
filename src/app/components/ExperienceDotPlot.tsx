import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink } from 'lucide-react';

interface DataPoint {
  id: string;
  score: number;
  username: string;
  excerpt: string;
  url: string;
  timestamp: string;
  age?: number;
  gender?: 'M' | 'F' | 'Other';
  category: 'negative' | 'neutral' | 'positive';
}

// Seeded random so positions are stable across renders
function sr(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const generateDataPoints = (): DataPoint[] => {
  const usernames = [
    'FitnessGuru23', 'HealthSeeker', 'GymRat420', 'SupplementReview', 'WorkoutWarrior',
    'NaturalLifter', 'BiohackerPro', 'StrengthFirst', 'LeanGains', 'MuscleBuilder',
  ];

  return Array.from({ length: 500 }, (_, i) => {
    const r = sr(i);
    let score: number;
    if (r < 0.72) {
      score = 6 + sr(i + 1000) * 4;
    } else {
      score = sr(i + 2000) * 5;
    }
    score = Math.round(score * 10) / 10;
    const category: DataPoint['category'] = score >= 7 ? 'positive' : score >= 5 ? 'neutral' : 'negative';

    return {
      id: `post-${i}`,
      score,
      category,
      username: usernames[Math.floor(sr(i + 3000) * usernames.length)],
      excerpt: score > 6
        ? 'Great results, noticed improvements in strength and recovery...'
        : 'Experienced some side effects, not sure if worth it...',
      url: `https://reddit.com/r/supplements/comments/${i}`,
      timestamp: `${Math.floor(sr(i + 4000) * 12) + 1} months ago`,
      age: Math.floor(sr(i + 5000) * 40) + 20,
      gender: sr(i + 6000) > 0.5 ? 'M' : 'F',
    };
  });
};

const dataPoints = generateDataPoints();

// SVG layout constants
const W = 820;
const H = 500;
const PAD = { top: 30, right: 30, bottom: 55, left: 44 };
const PW = W - PAD.left - PAD.right;
const PH = H - PAD.top - PAD.bottom;

const COLUMNS = [
  { id: 'negative' as const, label: 'Negative (0–4)', color: '#6b7280', xFrac: 0.18 },
  { id: 'neutral'  as const, label: 'Neutral (5–6)',   color: '#f97316', xFrac: 0.50 },
  { id: 'positive' as const, label: 'Positive (7–10)', color: '#6366f1', xFrac: 0.82 },
];

const colX = (frac: number) => PAD.left + PW * frac;
const scoreY = (s: number) => PAD.top + PH - (s / 10) * PH;
const JITTER = 32;
const GRID = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const userPrediction = { score: 7.5, confidence: 85 };

export function ExperienceDotPlot() {
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);

  const stats = useMemo(() =>
    COLUMNS.map(col => {
      const pts = dataPoints.filter(p => p.category === col.id).map(p => p.score).sort((a, b) => a - b);
      const mean = pts.reduce((s, v) => s + v, 0) / pts.length;
      const p25 = pts[Math.floor(pts.length * 0.25)];
      const p75 = pts[Math.floor(pts.length * 0.75)];
      return { ...col, mean, p25, p75, cx: colX(col.xFrac) };
    }), []);

  const positioned = useMemo(() =>
    dataPoints.map((p, i) => {
      const col = stats.find(c => c.id === p.category)!;
      const jitter = (sr(i * 7 + 99) - 0.5) * JITTER * 2;
      return { ...p, cx: col.cx + jitter, cy: scoreY(p.score), color: col.color };
    }), [stats]);

  const getColorByScore = (score: number) => {
    if (score >= 7) return '#6366f1';
    if (score >= 5) return '#f97316';
    return '#6b7280';
  };

  return (
    <div className="bg-[#111111] rounded-xl p-8 border border-[#1f1f1f] mb-16">
      <div className="mb-6">
        <h3 className="text-[18px] font-semibold text-white mb-2">Experience Distribution</h3>
        <p className="text-[14px] text-[#a1a1a1]">
          500 Reddit experiences grouped by sentiment. Click any dot to view the full post.
        </p>
      </div>

      <div className="relative bg-[#0a0a0a] rounded-xl border border-[#1f1f1f]/50 overflow-hidden">
        <svg
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Dashed horizontal grid lines */}
          {GRID.map(v => (
            <line
              key={v}
              x1={PAD.left} x2={W - PAD.right}
              y1={scoreY(v)} y2={scoreY(v)}
              stroke="#1f1f1f" strokeWidth="1" strokeDasharray="4 4"
            />
          ))}

          {/* Y-axis labels */}
          {[0, 2, 4, 6, 8, 10].map(v => (
            <text
              key={v}
              x={PAD.left - 8} y={scoreY(v) + 4}
              textAnchor="end" fill="#4b5563"
              fontSize="11" fontFamily="system-ui,sans-serif"
            >{v}</text>
          ))}

          {/* Dots */}
          {positioned.map((p, i) => {
            const hovered = hoveredPoint?.id === p.id;
            return (
              <motion.circle
                key={p.id}
                cx={p.cx} cy={p.cy}
                r={hovered ? 4.5 : 3}
                fill={p.color}
                opacity={hovered ? 1 : 0.5}
                className="cursor-pointer"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: hovered ? 1 : 0.5, scale: 1 }}
                transition={{ delay: i * 0.0004, duration: 0.25 }}
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
                onClick={() => setSelectedPoint(p)}
              />
            );
          })}

          {/* Per-column stat lines: p25, p75, mean */}
          {stats.map(col => (
            <g key={`stat-${col.id}`}>
              <line
                x1={col.cx - 38} x2={col.cx + 38}
                y1={scoreY(col.p25)} y2={scoreY(col.p25)}
                stroke={col.color} strokeWidth="1.5" opacity={0.45}
              />
              <line
                x1={col.cx - 38} x2={col.cx + 38}
                y1={scoreY(col.p75)} y2={scoreY(col.p75)}
                stroke={col.color} strokeWidth="1.5" opacity={0.45}
              />
              <line
                x1={col.cx - 50} x2={col.cx + 50}
                y1={scoreY(col.mean)} y2={scoreY(col.mean)}
                stroke={col.color} strokeWidth="2.5" opacity={0.9}
              />
            </g>
          ))}

          {/* User prediction marker on the positive column */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.circle
              cx={colX(0.82)} cy={scoreY(userPrediction.score)}
              r={6} fill="none"
              stroke="#7c3aed" strokeWidth="0.8" opacity={0.5}
              animate={{ r: [6, 9, 6], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <circle
              cx={colX(0.82)} cy={scoreY(userPrediction.score)}
              r={4} fill="#7c3aed" stroke="white" strokeWidth="0.8"
            />
          </motion.g>

          {/* X-axis column labels */}
          {stats.map(col => (
            <text
              key={`lbl-${col.id}`}
              x={col.cx} y={H - 12}
              textAnchor="middle" fill="#9ca3af"
              fontSize="12" fontFamily="system-ui,sans-serif"
            >{col.label}</text>
          ))}
        </svg>

        {/* Hover tooltip */}
        <AnimatePresence>
          {hoveredPoint && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.12 }}
              className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-[#18181b] text-white px-3 py-2 rounded-lg shadow-lg text-[12px] whitespace-nowrap pointer-events-none border border-[#2f2f2f]"
            >
              <div className="font-medium mb-0.5">u/{hoveredPoint.username}</div>
              <div className="text-[#a1a1aa]">Score: {hoveredPoint.score}/10 · {hoveredPoint.timestamp}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#1f1f1f]">
        <div className="flex items-center gap-6">
          {COLUMNS.map(col => (
            <div key={col.id} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
              <span className="text-[13px] text-[#a1a1a1]">{col.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-[#7c3aed]/10 px-3 py-2 rounded-lg border border-[#7c3aed]/20">
          <div className="w-2.5 h-2.5 rounded-full bg-[#7c3aed]" />
          <span className="text-[13px] text-[#a78bfa] font-medium">
            Your predicted outcome: {userPrediction.score}/10
          </span>
          <span className="text-[11px] text-[#a78bfa]/60">({userPrediction.confidence}% confidence)</span>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedPoint && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              onClick={() => setSelectedPoint(null)}
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
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getColorByScore(selectedPoint.score) }} />
                    <h3 className="text-[18px] font-semibold text-white">
                      Experience Score: {selectedPoint.score}/10
                    </h3>
                  </div>
                  <p className="text-[13px] text-[#a1a1a1]">
                    Posted by u/{selectedPoint.username} · {selectedPoint.timestamp}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPoint(null)}
                  className="w-8 h-8 rounded-lg hover:bg-[#1f1f1f] flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-[#a1a1a1]" />
                </button>
              </div>

              <div className="bg-[#0a0a0a] rounded-xl p-6 mb-6 border border-[#1f1f1f]">
                <p className="text-[15px] text-[#e5e5e5] leading-[1.7] mb-4">{selectedPoint.excerpt}</p>
                {selectedPoint.age && (
                  <div className="flex items-center gap-4 text-[13px] text-[#a1a1a1]">
                    <span>Age: {selectedPoint.age}</span>
                    <span>·</span>
                    <span>Gender: {selectedPoint.gender}</span>
                  </div>
                )}
              </div>

              <a
                href={selectedPoint.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg transition-colors text-[14px] font-medium"
              >
                <span>View full post on Reddit</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
