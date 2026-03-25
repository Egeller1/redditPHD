import { motion } from 'motion/react';
import { useState } from 'react';

interface DataPoint {
  x: number; // 0-10 sentiment score
  y: number; // vertical jitter for visual distribution
  sentiment: 'negative' | 'neutral' | 'positive';
}

// Generate 100 data points distributed across sentiment scale
const generateDataPoints = (): DataPoint[] => {
  const points: DataPoint[] = [];
  
  // Negative (0-4): 25 points
  for (let i = 0; i < 25; i++) {
    points.push({
      x: Math.random() * 4,
      y: Math.random() * 100,
      sentiment: 'negative'
    });
  }
  
  // Neutral (5-6): 20 points
  for (let i = 0; i < 20; i++) {
    points.push({
      x: 5 + Math.random() * 2,
      y: Math.random() * 100,
      sentiment: 'neutral'
    });
  }
  
  // Positive (7-10): 55 points
  for (let i = 0; i < 55; i++) {
    points.push({
      x: 7 + Math.random() * 3,
      y: Math.random() * 100,
      sentiment: 'positive'
    });
  }
  
  return points;
};

const dataPoints = generateDataPoints();

export function GlobalPostsVisualization() {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'negative':
        return '#6b7280';
      case 'neutral':
        return '#f97316';
      case 'positive':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="relative w-full bg-[#0a0a0a] rounded-xl border border-[#1f1f1f] overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#1f1f1f] px-8 py-6">
        <h3 className="text-[18px] font-medium text-white mb-2">Experience Distribution</h3>
        <p className="text-[13px] text-[#a1a1a1]">
          100 Reddit experiences plotted from negative (0) to positive (10). Click any dot to view the full post.
        </p>
      </div>

      {/* Scatter plot */}
      <div className="relative px-8 py-12">
        <div className="relative h-[400px]">
          {/* Y-axis grid lines (subtle) */}
          <div className="absolute inset-0">
            {[0, 25, 50, 75, 100].map((y) => (
              <div
                key={y}
                className="absolute left-0 right-0 border-t border-[#1a1a1a]"
                style={{ top: `${y}%` }}
              />
            ))}
          </div>

          {/* X-axis labels */}
          <div className="absolute -bottom-8 left-0 right-0 flex justify-between px-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
              <div key={value} className="text-[11px] text-[#6b7280] font-mono">
                {value}
              </div>
            ))}
          </div>

          {/* Data points */}
          {dataPoints.map((point, index) => (
            <motion.div
              key={index}
              className="absolute cursor-pointer group"
              style={{
                left: `${(point.x / 10) * 100}%`,
                top: `${point.y}%`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.005, duration: 0.3 }}
              onMouseEnter={() => setHoveredPoint(index)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              {/* Highlight ring for one specific point */}
              {index === 67 && (
                <motion.div
                  className="absolute -inset-3 rounded-full border-2 border-[#8b5cf6]"
                  initial={{ scale: 1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 2 }}
                />
              )}
              
              {/* Dot */}
              <div
                className="w-[10px] h-[10px] rounded-full transition-all duration-200"
                style={{
                  backgroundColor: getSentimentColor(point.sentiment),
                  opacity: hoveredPoint === index ? 1 : index === 67 ? 0.9 : 0.7,
                  transform: hoveredPoint === index ? 'scale(1.3)' : 'scale(1)',
                  border: index === 67 ? '2px solid #8b5cf6' : 'none',
                }}
              />

              {/* Tooltip on hover */}
              {hoveredPoint === index && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-[#111111] border border-[#1f1f1f] rounded-lg px-3 py-2 shadow-xl whitespace-nowrap z-50"
                >
                  <div className="text-[11px] text-white font-medium mb-1">
                    Score: {point.x.toFixed(1)}/10
                  </div>
                  <div className="text-[10px] text-[#a1a1a1]">
                    Click to view post
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* X-axis label */}
        <div className="text-center mt-12 text-[12px] text-[#6b7280]">
          Distribution of 100 Posts
        </div>
      </div>

      {/* Legend and prediction */}
      <div className="border-t border-[#1f1f1f] px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-[10px] h-[10px] rounded-full bg-[#8b5cf6]" />
            <span className="text-[12px] text-[#a1a1a1]">Positive (7-10)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-[10px] h-[10px] rounded-full bg-[#f97316]" />
            <span className="text-[12px] text-[#a1a1a1]">Neutral (5-6)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-[10px] h-[10px] rounded-full bg-[#6b7280]" />
            <span className="text-[12px] text-[#a1a1a1]">Negative (0-4)</span>
          </div>
        </div>
      </div>
    </div>
  );
}