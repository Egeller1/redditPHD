import React from 'react';
import { HexHeatmap } from './HexHeatmap';

export function GlobalPostsVisualization() {
  return (
    <div className="relative w-full bg-[#0a0a0a] rounded-xl border border-[#1f1f1f] overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#1f1f1f] px-8 py-6">
        <h3 className="text-[18px] font-medium text-white mb-2">Experience Distribution</h3>
        <p className="text-[13px] text-[#a1a1a1]">
          Density of 500 Reddit experiences from negative (0) to positive (10).
        </p>
      </div>

      {/* Hex heatmap */}
      <div className="px-6 pt-6 pb-2">
        <HexHeatmap className="w-full" />
      </div>

      {/* X-axis label */}
      <div className="text-center pb-5 text-[12px] text-[#6b7280]">
        Sentiment Score (0 = negative · 10 = positive)
      </div>

      {/* Legend */}
      <div className="border-t border-[#1f1f1f] px-8 py-5 flex items-center gap-3">
        <span className="text-[12px] text-[#6b7280]">Low density</span>
        <div
          className="flex-1 h-[6px] rounded-full"
          style={{
            background: 'linear-gradient(to right, #08104a, #1a3aaf, #6014aa, #c41230, #e85d04, #ffd166)',
          }}
        />
        <span className="text-[12px] text-[#6b7280]">High density</span>
      </div>
    </div>
  );
}
