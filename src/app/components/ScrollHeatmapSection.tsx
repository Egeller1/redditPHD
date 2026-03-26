import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';
import { User } from 'lucide-react';
import { HexHeatmap } from './HexHeatmap';

interface Blurb {
  id: number;
  username: string;
  sub: string;
  text: string;
  /** pixel offset from viewport center when fully scattered */
  ix: number;
  iy: number;
}

const BLURBS: Blurb[] = [
  { id:  0, username: 'fitness_enthusiast', sub: 'r/fitness',         text: '"3 months in — bench went up 15 lbs. Creatine is the real deal."',                          ix: -520, iy: -210 },
  { id:  1, username: 'health_seeker',      sub: 'r/supplements',     text: '"5 g daily, no loading phase. Water retention gone by week 2. Highly recommend."',           ix:  400, iy: -250 },
  { id:  2, username: 'GymRat420',          sub: 'r/bodybuilding',    text: '"Creatine mono is the most-researched supp out there. Just take it every day."',            ix: -460, iy:   50 },
  { id:  3, username: 'NaturalLifter',      sub: 'r/nattyorjuice',    text: '"Recovery between sets noticeably faster. Squat volume doubled in two months."',            ix:  450, iy:  100 },
  { id:  4, username: 'SupplementNerd',     sub: 'r/supplements',     text: '"Cheap, effective, well-studied. There\'s no real reason NOT to take creatine."',           ix: -210, iy: -300 },
  { id:  5, username: 'WorkoutWarrior',     sub: 'r/fitness',         text: '"Skip the loading phase. 5 g/day consistently. Took about 3 weeks to feel it."',            ix:  170, iy: -315 },
  { id:  6, username: 'BiohackerPro',       sub: 'r/nootropics',      text: '"Cognitive benefits are real — noticeably clearer focus during heavy sessions."',           ix: -550, iy:  -95 },
  { id:  7, username: 'MuscleBuilder99',    sub: 'r/gainit',          text: '"Two years in, plain monohydrate. Nothing fancy needed. Consistent results."',              ix:  490, iy: -155 },
  { id:  8, username: 'LeanGainz',          sub: 'r/leangains',       text: '"Scale jumped 2 lbs first week — just water. Don\'t panic. Stay consistent."',             ix: -305, iy:  255 },
  { id:  9, username: 'StrengthCoach',      sub: 'r/strength_training',text: '"I recommend it to every single client. Safest, most effective supp available."',          ix:  325, iy:  265 },
  { id: 10, username: 'PumpChaser',         sub: 'r/bodybuilding',    text: '"Muscle fullness is noticeably better. The pump lasts way longer on creatine."',            ix:  -75, iy:  315 },
  { id: 11, username: 'RecoveryBro',        sub: 'r/running',         text: '"Helps endurance sports too — not just lifting. Anyone high-output should try it."',        ix:  485, iy:  190 },
  { id: 12, username: 'ScienceOfGains',     sub: 'r/askscience',      text: '"Replenishes phosphocreatine stores in muscle. Literally more ATP available per rep."',     ix: -435, iy:  200 },
  { id: 13, username: 'DietOptimizer',      sub: 'r/nutrition',       text: '"Take post-workout with carbs. Better cellular uptake and glycogen replenishment."',        ix:   75, iy:  330 },
  { id: 14, username: 'GainsGoblin',        sub: 'r/gainit',          text: '"Creatine + protein + sleep. The actual holy trinity. Everything else is noise."',          ix: -155, iy: -355 },
];

// Individual card — must be its own component so hooks are called unconditionally
function BlurbCard({ blurb, progress }: { blurb: Blurb; progress: MotionValue<number> }) {
  // Slow start, rapid convergence toward the end
  const x = useTransform(progress, [0, 0.18, 0.62, 1], [blurb.ix, blurb.ix * 0.9, blurb.ix * 0.08, 0]);
  const y = useTransform(progress, [0, 0.18, 0.62, 1], [blurb.iy, blurb.iy * 0.9, blurb.iy * 0.08, 0]);
  const scale  = useTransform(progress, [0.52, 0.92], [1, 0.05]);
  const opacity = useTransform(progress, [0, 0.42, 0.80, 0.94], [0.93, 0.93, 0.25, 0]);

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        marginLeft: -125,   // half of w-[250px]
        marginTop: -58,     // approximate half-height
        x,
        y,
        scale,
        opacity,
        zIndex: 10,
      }}
      className="w-[250px] pointer-events-none"
    >
      <div className="bg-[#111111]/95 backdrop-blur-sm border border-[#1f1f1f] rounded-xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-[#ef4444]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <User className="w-3.5 h-3.5 text-[#ef4444]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-white">u/{blurb.username}</span>
              <span className="text-[10px] text-[#6b7280]">{blurb.sub}</span>
            </div>
            <p className="text-[12px] text-[#a1a1a1] leading-relaxed">{blurb.text}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ScrollHeatmapSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const heatmapOpacity = useTransform(scrollYProgress, [0.55, 0.90], [0, 1]);
  const heatmapScale   = useTransform(scrollYProgress, [0.55, 0.90], [0.93, 1]);

  // Section label fades in at start, fades out mid-way
  const labelOpacity = useTransform(scrollYProgress, [0, 0.12, 0.42, 0.58], [0, 1, 1, 0]);
  const labelY       = useTransform(scrollYProgress, [0, 0.12], [16, 0]);

  // Scroll hint arrow fades out as soon as user starts scrolling
  const hintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  return (
    <div ref={containerRef} style={{ height: '320vh' }} className="relative">
      {/* Sticky viewport */}
      <div
        style={{ position: 'sticky', top: 0, height: '100vh' }}
        className="overflow-hidden bg-[#0a0a0a] flex items-center justify-center"
      >
        {/* Section label */}
        <motion.p
          style={{ opacity: labelOpacity, y: labelY }}
          className="absolute top-10 left-0 right-0 text-center z-20 pointer-events-none
                     text-[13px] text-[#6b7280] uppercase tracking-[0.14em] font-medium"
        >
          What Reddit says about creatine
        </motion.p>

        {/* Scattered blurb cards */}
        {BLURBS.map(blurb => (
          <BlurbCard key={blurb.id} blurb={blurb} progress={scrollYProgress} />
        ))}

        {/* Heatmap — fades in as cards converge */}
        <motion.div
          style={{ opacity: heatmapOpacity, scale: heatmapScale }}
          className="absolute inset-x-6 md:inset-x-14 z-0"
        >
          <div className="bg-[#0d0d0d] rounded-xl border border-[#1f1f1f]/60 px-4 pt-5 pb-2">
            <div className="mb-3 px-1 flex items-center justify-between">
              <div>
                <p className="text-[13px] text-[#6b7280] uppercase tracking-[0.1em] font-medium">
                  Experience Distribution
                </p>
                <p className="text-[11px] text-[#4b5563] mt-0.5">
                  Density of Reddit posts · 0 = negative · 10 = positive
                </p>
              </div>
              {/* Colour scale */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-[#4b5563]">Low</span>
                <div
                  className="w-20 h-[5px] rounded-full"
                  style={{ background: 'linear-gradient(to right, #08104a, #1a3aaf, #6014aa, #c41230, #e85d04, #ffd166)' }}
                />
                <span className="text-[10px] text-[#4b5563]">High</span>
              </div>
            </div>
            <HexHeatmap className="w-full" />
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          style={{ opacity: hintOpacity }}
          className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none"
        >
          <span className="text-[11px] text-[#4b5563] uppercase tracking-widest">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-px h-6 bg-gradient-to-b from-[#4b5563] to-transparent"
          />
        </motion.div>
      </div>
    </div>
  );
}
