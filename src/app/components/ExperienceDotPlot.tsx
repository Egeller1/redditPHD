import React from 'react';
import { HexHeatmap } from './HexHeatmap';

const userPrediction = { score: 7.5, confidence: 85 };

export function ExperienceDotPlot() {
  return (
    <div className="bg-[#111111] rounded-xl p-8 border border-[#1f1f1f] mb-16">
      <div className="mb-6">
        <h3 className="text-[18px] font-semibold text-white mb-2">Experience Distribution</h3>
        <p className="text-[14px] text-[#a1a1a1]">
          Heat map of 500 Reddit experiences — warmer colours indicate higher post density.
        </p>
      </div>

      <div className="bg-[#0a0a0a] rounded-xl border border-[#1f1f1f]/50 px-4 pt-4 pb-1">
        <HexHeatmap
          predictionScore={userPrediction.score}
          predictionLabel={`Your prediction: ${userPrediction.score}/10`}
          className="w-full"
        />
        <div className="text-center pb-3 text-[11px] text-[#6b7280]">
          Sentiment Score (0 = negative · 10 = positive)
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#1f1f1f]">
        <div className="flex items-center gap-3 flex-1 mr-6">
          <span className="text-[12px] text-[#6b7280] whitespace-nowrap">Low density</span>
          <div
            className="flex-1 h-[6px] rounded-full"
            style={{ background: 'linear-gradient(to right, #08104a, #1a3aaf, #6014aa, #c41230, #e85d04, #ffd166)' }}
          />
          <span className="text-[12px] text-[#6b7280] whitespace-nowrap">High density</span>
        </div>
        <div className="flex items-center gap-2 bg-[#7c3aed]/10 px-3 py-2 rounded-lg border border-[#7c3aed]/20 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[#7c3aed]" />
          <span className="text-[13px] text-[#a78bfa] font-medium">
            Your predicted outcome: {userPrediction.score}/10
          </span>
          <span className="text-[11px] text-[#a78bfa]/60">({userPrediction.confidence}% confidence)</span>
        </div>
      </div>
    </div>
  );
}
