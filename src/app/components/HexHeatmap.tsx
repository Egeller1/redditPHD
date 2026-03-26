import React, { useMemo } from 'react';

// --- Hex grid constants (flat-top orientation) ---
const R = 12;                              // circumradius
const COL_SPACING = R * 1.5;              // 18
const ROW_SPACING = R * Math.sqrt(3);     // ~20.8
const NUM_COLS = 46;
const NUM_ROWS = 15;
const SVG_W = COL_SPACING * NUM_COLS + R;
const SVG_H = ROW_SPACING * (NUM_ROWS + 0.5) + R;

// Flat-top hex path (gap of 1px between hexes)
const HEX_PATH = (() => {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i;
    return `${(R - 1) * Math.cos(a).toFixed(3)},${(R - 1) * Math.sin(a).toFixed(3)}`;
  });
  return `M ${pts.join(' L ')} Z`;
})();

// Seeded random (stable across renders)
function sr(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// Heat colour scale: 0 = cold/empty, 1 = peak hot
function heatColor(t: number): [string, number] {
  if (t <= 0) return ['#050510', 0.15];

  type Stop = [number, [number, number, number]];
  const stops: Stop[] = [
    [0.00, [8,   12,  40]],
    [0.18, [15,  45,  160]],
    [0.38, [90,  20,  170]],
    [0.58, [200, 30,  45]],
    [0.78, [230, 95,  15]],
    [1.00, [253, 200, 50]],
  ];

  let i = 0;
  while (i < stops.length - 2 && stops[i + 1][0] <= t) i++;
  const [t0, c0] = stops[i];
  const [t1, c1] = stops[i + 1];
  const f = Math.max(0, Math.min(1, (t - t0) / (t1 - t0)));
  const r = Math.round(c0[0] + f * (c1[0] - c0[0]));
  const g = Math.round(c0[1] + f * (c1[1] - c0[1]));
  const b = Math.round(c0[2] + f * (c1[2] - c0[2]));
  return [`rgb(${r},${g},${b})`, 0.7 + t * 0.3];
}

// Base density for a given score 0–10
// 72 % of posts land in 6–10, 28 % in 0–6
function baseDensity(score: number): number {
  if (score < 0 || score > 10) return 0;
  if (score >= 6) return 0.6 + ((score - 6) / 4) * 0.4; // 0.6 → 1.0
  if (score >= 5) return 0.32;
  return 0.08 + (score / 5) * 0.22;                      // 0.08 → 0.30
}

/** Returns the exact [fill color, opacity] for a specific grid cell — use this
 *  for any overlay hexes that need to look identical to their heatmap neighbors. */
export function getCellColor(col: number, row: number): [string, number] {
  const score = (col / (NUM_COLS - 1)) * 10;
  const base = baseDensity(score);
  const rowEnv = Math.sin((row / (NUM_ROWS - 1)) * Math.PI);
  const noise = (Math.sin(col * 0.7 + row * 1.3) * 0.5 +
                 Math.cos(col * 1.1 - row * 0.9) * 0.5) * 0.15;
  const t = Math.max(0, Math.min(1, base * (0.55 + rowEnv * 0.55) + noise));
  return heatColor(t);
}

export interface HexHeatmapProps {
  /** Show a vertical dashed prediction line at this score (0-10) */
  predictionScore?: number;
  /** Label shown next to the prediction line */
  predictionLabel?: string;
  className?: string;
  /** Optional ref forwarded to the inner <svg> element (used for position measurement) */
  svgRef?: React.Ref<SVGSVGElement>;
  /** Cells to leave blank (used for fly-in animation targets) */
  excludeCells?: ReadonlyArray<{ col: number; row: number }>;
}

export function HexHeatmap({ predictionScore, predictionLabel, className, svgRef, excludeCells }: HexHeatmapProps) {
  const hexes = useMemo(() => {
    const excluded = new Set(excludeCells?.map(c => `${c.col},${c.row}`) ?? []);
    const out: { cx: number; cy: number; fill: string; opacity: number }[] = [];

    for (let col = 0; col < NUM_COLS; col++) {
      const cx = R + col * COL_SPACING;
      const score = (col / (NUM_COLS - 1)) * 10;
      const base = baseDensity(score);

      for (let row = 0; row < NUM_ROWS; row++) {
        // Leave blank so the flying hex can fill this spot
        if (excluded.has(`${col},${row}`)) continue;

        const cy = R + row * ROW_SPACING + (col % 2 === 1 ? ROW_SPACING / 2 : 0);

        // Row envelope: denser in mid-rows, tapers at top/bottom
        const rowEnv = Math.sin((row / (NUM_ROWS - 1)) * Math.PI);

        // Smooth noise via trig to avoid jitter
        const noise = (Math.sin(col * 0.7 + row * 1.3) * 0.5 +
                       Math.cos(col * 1.1 - row * 0.9) * 0.5) * 0.15;

        const t = Math.max(0, Math.min(1, base * (0.55 + rowEnv * 0.55) + noise));

        // Randomly drop very sparse cells to create organic gaps
        if (t < 0.12 && sr(col * 31 + row * 17) > 0.35) continue;

        const [fill, opacity] = heatColor(t);
        out.push({ cx, cy, fill, opacity });
      }
    }
    return out;
  }, [excludeCells]);

  // X position of prediction line
  const predX = predictionScore != null
    ? R + (predictionScore / 10) * (NUM_COLS - 1) * COL_SPACING
    : null;

  // X-axis score labels (every 1 unit)
  const axisLabels = Array.from({ length: 11 }, (_, i) => ({
    score: i,
    x: R + (i / 10) * (NUM_COLS - 1) * COL_SPACING,
  }));

  return (
    <div className={className}>
      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${SVG_W} ${SVG_H + 22}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block' }}
      >
        {/* Hex cells */}
        {hexes.map(({ cx, cy, fill, opacity }, i) => (
          <path
            key={i}
            d={HEX_PATH}
            transform={`translate(${cx},${cy})`}
            fill={fill}
            opacity={opacity}
          />
        ))}

        {/* Prediction marker */}
        {predX != null && (
          <g>
            <line
              x1={predX} x2={predX}
              y1={0} y2={SVG_H - 4}
              stroke="#7c3aed"
              strokeWidth="1.5"
              strokeDasharray="5 3"
              opacity={0.8}
            />
            <circle cx={predX} cy={SVG_H / 2} r={5} fill="#7c3aed" stroke="white" strokeWidth="1.2" />
            {predictionLabel && (
              <text
                x={predX + 8} y={SVG_H / 2 - 8}
                fill="#a78bfa" fontSize="11"
                fontFamily="system-ui,sans-serif"
              >{predictionLabel}</text>
            )}
          </g>
        )}

        {/* X-axis labels */}
        {axisLabels.map(({ score, x }) => (
          <text
            key={score}
            x={x} y={SVG_H + 16}
            textAnchor="middle"
            fill="#4b5563"
            fontSize="11"
            fontFamily="system-ui,sans-serif"
          >{score}</text>
        ))}
      </svg>
    </div>
  );
}
