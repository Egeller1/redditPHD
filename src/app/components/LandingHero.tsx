import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, MotionValue, useMotionValueEvent, useSpring } from 'motion/react';
import { useNavigate } from 'react-router';
import { HexHeatmap, getCellColor } from './HexHeatmap';
import { queryParamToSlug } from '@/lib/slug';

// HexHeatmap grid constants (must match HexHeatmap.tsx exactly)
const HEX_R        = 12;
const COL_SPACING  = HEX_R * 1.5;           // 18
const ROW_SPACING  = HEX_R * Math.sqrt(3);  // ~20.785
const SVG_VIEW_W   = 840;                   // COL_SPACING*46 + HEX_R

// Flat-top hex path (R=11, 1px gap like HexHeatmap)
const HEX_PATH = 'M 11,0 L 5.5,9.526 L -5.5,9.526 L -11,0 L -5.5,-9.526 L 5.5,-9.526 Z';

function easeInOut(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c < 0.5 ? 2 * c * c : 1 - Math.pow(-2 * c + 2, 2) / 2;
}

const trendingSearches = [
  { term: 'Creatine',             category: 'Supplements',   color: '#7c3aed' },
  { term: 'Cold showers',         category: 'Wellness',      color: '#0ea5e9' },
  { term: 'SSRIs',                category: 'Mental Health', color: '#ec4899' },
  { term: 'Ashwagandha',          category: 'Supplements',   color: '#10b981' },
  { term: 'Intermittent fasting', category: 'Diet',          color: '#f59e0b' },
];

interface Blurb {
  id: number; username: string; sub: string; text: string;
  ix: number; iy: number;      // initial scatter position (px from viewport center)
  col: number; row: number;    // target cell in HexHeatmap grid (color computed via getCellColor)
  floatDelay: number;
  tEx: number; tEy: number;    // thread endpoint (nearest red dot, px from center)
}

// Spread across the full sentiment range — negative, neutral, and positive.
// col = round(score/10 * 45). Cell color is computed at runtime via getCellColor(col, row).
const BLURBS: Blurb[] = [
  // ── NEGATIVE ──────────────────────────────────────────────────────────────
  { id:  0, username: 'SoreStomach',      sub: 'r/supplements',       text: '"Stomach cramps every morning. Tried two brands — same result. Had to quit."',    ix: -520, iy: -200, col:  7, row:  7, floatDelay: 0.0, tEx: -555, tEy: -240 },
  { id:  1, username: 'NoBros',           sub: 'r/fitness',           text: '"Gave it a full 8 weeks, zero noticeable change in strength or muscle size."',     ix:  430, iy: -230, col: 11, row:  5, floatDelay: 0.5, tEx:  420, tEy: -210 },
  { id:  2, username: 'WaterBloat22',     sub: 'r/bodybuilding',      text: '"So much water retention I actually looked worse. Dropped it after a month."',    ix: -380, iy:   60, col:  9, row:  9, floatDelay: 0.9, tEx: -430, tEy:   30 },
  // ── NEUTRAL / MIXED ───────────────────────────────────────────────────────
  { id:  3, username: 'MaybePlacebo',     sub: 'r/askscience',        text: '"Slight edge maybe? Hard to separate from better sleep and diet that week."',     ix:  500, iy:   45, col: 16, row:  6, floatDelay: 1.3, tEx:  495, tEy:  -55 },
  { id:  4, username: 'MehLifter',        sub: 'r/leangains',         text: '"Inconsistent — some weeks felt great, others felt like nothing changed."',       ix: -250, iy: -250, col: 20, row: 10, floatDelay: 0.3, tEx: -180, tEy: -225 },
  { id:  5, username: 'AverageJoeGym',    sub: 'r/nattyorjuice',      text: '"Average gains. Works for some people, did nothing special for me."',             ix:  255, iy: -260, col: 23, row:  8, floatDelay: 1.1, tEx:  240, tEy: -230 },
  { id:  6, username: 'MarginalGains',    sub: 'r/nutrition',         text: '"Fine. Marginal benefit. Probably worth the $10 but don\'t expect miracles."',    ix: -560, iy:  -85, col: 27, row:  5, floatDelay: 0.6, tEx: -580, tEy: -105 },
  // ── POSITIVE ──────────────────────────────────────────────────────────────
  { id:  7, username: 'fitness_enthusiast', sub: 'r/fitness',         text: '"3 months in — bench went up 15 lbs. Creatine is the real deal."',               ix:  540, iy: -105, col: 38, row:  4, floatDelay: 1.5, tEx:  510, tEy: -155 },
  { id:  8, username: 'health_seeker',      sub: 'r/supplements',     text: '"5 g daily, no loading phase. Water retention gone by week 2."',                  ix: -300, iy:  195, col: 34, row:  8, floatDelay: 0.2, tEx: -375, tEy:  140 },
  { id:  9, username: 'StrengthCoach',      sub: 'r/strength_training',text: '"I recommend it to every single client. Safest, most effective supp available."',ix:  320, iy:  215, col: 43, row:  7, floatDelay: 1.2, tEx:  250, tEy:  180 },
  { id: 10, username: 'PumpChaser',         sub: 'r/bodybuilding',    text: '"Muscle fullness noticeably better. The pump lasts way longer on creatine."',     ix:  -65, iy:  255, col: 36, row:  8, floatDelay: 0.7, tEx:  -80, tEy:  120 },
  { id: 11, username: 'RecoveryBro',        sub: 'r/running',         text: '"Helps endurance sports too — not just lifting. High-output athletes: try it."',  ix:  475, iy:  175, col: 41, row: 10, floatDelay: 1.4, tEx:  430, tEy:  190 },
  { id: 12, username: 'ScienceOfGains',     sub: 'r/askscience',      text: '"Replenishes phosphocreatine in muscle. Literally more ATP available per rep."',  ix: -500, iy:  155, col: 38, row:  9, floatDelay: 0.5, tEx: -470, tEy:  115 },
  { id: 13, username: 'GymRat420',          sub: 'r/gainit',          text: '"Two years straight. Plain monohydrate, nothing fancy. Consistent results."',     ix:  135, iy:  265, col: 32, row:  7, floatDelay: 1.0, tEx:  100, tEy:  135 },
  { id: 14, username: 'GainsGoblin',        sub: 'r/gainit',          text: '"Creatine + protein + sleep. The actual holy trinity. Everything else is noise."', ix: -155, iy: -265, col: 41, row:  5, floatDelay: 1.7, tEx:  -90, tEy: -260 },
];

// ── Reddit-style chibi avatars (one per blurb, wraps with %) ──────────────────
const AVATARS: (() => React.ReactElement)[] = [
  // 0: Teal short hair, light skin, neutral expression
  () => <svg viewBox="0 0 32 32" fill="none" className="w-full h-full"><circle cx="16" cy="16" r="16" fill="#0f4c4c"/><rect x="9" y="24" width="14" height="8" rx="3" fill="#0d9488"/><circle cx="16" cy="17" r="7.5" fill="#FFD5B5"/><path d="M 8 14 Q 10 8 16 9 Q 22 8 24 14 Q 22 11 16 11 Q 10 11 8 14" fill="#0d9488"/><rect x="6.5" y="13" width="3.5" height="5" rx="1.7" fill="#0d9488"/><rect x="22" y="13" width="3.5" height="5" rx="1.7" fill="#0d9488"/><circle cx="13" cy="17" r="1.4" fill="#374151"/><circle cx="19" cy="17" r="1.4" fill="#374151"/><circle cx="13.5" cy="16.3" r="0.5" fill="white"/><circle cx="19.5" cy="16.3" r="0.5" fill="white"/><path d="M 13.5 21 Q 16 22.5 18.5 21" stroke="#c87040" strokeWidth="1.1" fill="none" strokeLinecap="round"/></svg>,

  // 1: Dark skin, afro, square glasses
  () => <svg viewBox="0 0 32 32" fill="none" className="w-full h-full"><circle cx="16" cy="16" r="16" fill="#7c3419"/><rect x="9" y="24" width="14" height="8" rx="3" fill="#f97316"/><ellipse cx="16" cy="12" rx="9.5" ry="8.5" fill="#111"/><circle cx="16" cy="17" r="7.5" fill="#7B3F00"/><rect x="9.5" y="14" width="5" height="4" rx="1" stroke="#444" strokeWidth="1" fill="none"/><rect x="17.5" y="14" width="5" height="4" rx="1" stroke="#444" strokeWidth="1" fill="none"/><line x1="14.5" y1="16" x2="17.5" y2="16" stroke="#444" strokeWidth="1"/><circle cx="12" cy="16" r="0.9" fill="#1a1a1a"/><circle cx="20" cy="16" r="0.9" fill="#1a1a1a"/><path d="M 12.5 21 Q 16 23.5 19.5 21" stroke="#5a2d00" strokeWidth="1.1" fill="none" strokeLinecap="round"/></svg>,

  // 2: Girl, brown hair, pink flower
  () => <svg viewBox="0 0 32 32" fill="none" className="w-full h-full"><circle cx="16" cy="16" r="16" fill="#be185d"/><rect x="9" y="24" width="14" height="8" rx="3" fill="#6366f1"/><ellipse cx="16" cy="15" rx="9" ry="9" fill="#6B3A2A"/><rect x="6.5" y="14" width="4" height="12" rx="2" fill="#6B3A2A"/><rect x="21.5" y="14" width="4" height="12" rx="2" fill="#6B3A2A"/><circle cx="16" cy="17" r="7.5" fill="#FFD5B5"/><path d="M 8 14 Q 12 9 16 10 Q 20 9 24 14 Q 22 11 16 11 Q 10 11 8 14" fill="#6B3A2A"/><circle cx="22" cy="9" r="3" fill="#ff80aa"/><circle cx="24.5" cy="8" r="1.8" fill="#ff80aa"/><circle cx="22" cy="6.5" r="1.8" fill="#ff80aa"/><circle cx="19.5" cy="8" r="1.8" fill="#ff80aa"/><circle cx="22" cy="9" r="1.5" fill="#ffd700"/><circle cx="13" cy="16.5" r="1.4" fill="#4a90d9"/><circle cx="19" cy="16.5" r="1.4" fill="#4a90d9"/><circle cx="13.5" cy="15.8" r="0.5" fill="white"/><circle cx="19.5" cy="15.8" r="0.5" fill="white"/><path d="M 13 20 Q 16 22.5 19 20" stroke="#c87040" strokeWidth="1.1" fill="none" strokeLinecap="round"/><ellipse cx="11" cy="19.5" rx="2" ry="1" fill="#ffb3ba" opacity="0.6"/><ellipse cx="21" cy="19.5" rx="2" ry="1" fill="#ffb3ba" opacity="0.6"/></svg>,

  // 3: Blue spiky hair
  () => <svg viewBox="0 0 32 32" fill="none" className="w-full h-full"><circle cx="16" cy="16" r="16" fill="#0c4a6e"/><rect x="9" y="24" width="14" height="8" rx="3" fill="#0ea5e9"/><circle cx="16" cy="17" r="7.5" fill="#FFD5B5"/><polygon points="10,13 12,4 14,12" fill="#0ea5e9"/><polygon points="13,11 15,2.5 17,11" fill="#38bdf8"/><polygon points="16,11 18,4 20,12" fill="#0ea5e9"/><polygon points="19,12 21,5.5 23,13" fill="#38bdf8"/><ellipse cx="16" cy="13" rx="7" ry="3.5" fill="#0ea5e9"/><circle cx="13" cy="17" r="1.5" fill="#0369a1"/><circle cx="19" cy="17" r="1.5" fill="#0369a1"/><circle cx="13.5" cy="16.3" r="0.5" fill="white"/><circle cx="19.5" cy="16.3" r="0.5" fill="white"/><path d="M 13.5 20.5 Q 16 22.5 18.5 20.5" stroke="#c87040" strokeWidth="1.1" fill="none" strokeLinecap="round"/></svg>,

  // 4: Long black hair, beard, coffee
  () => <svg viewBox="0 0 32 32" fill="none" className="w-full h-full"><circle cx="16" cy="16" r="16" fill="#111827"/><rect x="8" y="23" width="16" height="9" rx="3" fill="#1f2937"/><rect x="6" y="13" width="5" height="15" rx="2.5" fill="#111"/><rect x="21" y="13" width="5" height="15" rx="2.5" fill="#111"/><circle cx="16" cy="16" r="7.5" fill="#FFDAB9"/><path d="M 7 14 Q 11 7 16 8 Q 21 7 25 14 Q 23 10 16 10 Q 9 10 7 14" fill="#111"/><path d="M 10 22 Q 13 26 16 26 Q 19 26 22 22 Q 19 25 16 25 Q 13 25 10 22" fill="#111"/><circle cx="13" cy="15" r="1.3" fill="#333"/><circle cx="19" cy="15" r="1.3" fill="#333"/><circle cx="13.5" cy="14.4" r="0.45" fill="white"/><circle cx="19.5" cy="14.4" r="0.45" fill="white"/><rect x="22" y="20" width="5" height="5.5" rx="1" fill="white" opacity="0.9"/><rect x="22" y="20" width="5" height="2" rx="1" fill="#f97316"/><path d="M 27 21.5 Q 29 21 29 22.5 Q 29 24 27 23.5" stroke="#f97316" strokeWidth="0.8" fill="none"/></svg>,

  // 5: Purple wavy hair
  () => <svg viewBox="0 0 32 32" fill="none" className="w-full h-full"><circle cx="16" cy="16" r="16" fill="#6d28d9"/><rect x="9" y="24" width="14" height="8" rx="3" fill="#7c3aed"/><rect x="6" y="13" width="4.5" height="14" rx="2" fill="#7c3aed"/><rect x="21.5" y="13" width="4.5" height="14" rx="2" fill="#7c3aed"/><circle cx="16" cy="17" r="7.5" fill="#FFE4C4"/><path d="M 8 13 Q 12 7 16 8.5 Q 20 7 24 13 Q 21 10 16 10 Q 11 10 8 13" fill="#9333ea"/><circle cx="13" cy="17" r="1.4" fill="#6d28d9"/><circle cx="19" cy="17" r="1.4" fill="#6d28d9"/><circle cx="13.5" cy="16.3" r="0.5" fill="white"/><circle cx="19.5" cy="16.3" r="0.5" fill="white"/><path d="M 13 21 Q 16 23 19 21" stroke="#a16207" strokeWidth="1.1" fill="none" strokeLinecap="round"/><ellipse cx="11" cy="20" rx="1.8" ry="1" fill="#ffb3ba" opacity="0.5"/><ellipse cx="21" cy="20" rx="1.8" ry="1" fill="#ffb3ba" opacity="0.5"/></svg>,

  // 6: Ginger bun, freckles, green eyes
  () => <svg viewBox="0 0 32 32" fill="none" className="w-full h-full"><circle cx="16" cy="16" r="16" fill="#c2410c"/><rect x="9" y="24" width="14" height="8" rx="3" fill="#fed7aa"/><circle cx="16" cy="17" r="7.5" fill="#FFDAB9"/><path d="M 8 14 Q 12 9 16 10 Q 20 9 24 14 Q 22 11 16 11 Q 10 11 8 14" fill="#c2410c"/><circle cx="16" cy="7" r="4" fill="#dc2626"/><circle cx="16" cy="7" r="2.5" fill="#c2410c"/><circle cx="12.5" cy="18.5" r="0.6" fill="#b45309" opacity="0.7"/><circle cx="14.2" cy="19.5" r="0.5" fill="#b45309" opacity="0.7"/><circle cx="19.5" cy="18.5" r="0.6" fill="#b45309" opacity="0.7"/><circle cx="17.8" cy="19.5" r="0.5" fill="#b45309" opacity="0.7"/><circle cx="13" cy="17" r="1.4" fill="#16a34a"/><circle cx="19" cy="17" r="1.4" fill="#16a34a"/><circle cx="13.5" cy="16.3" r="0.5" fill="white"/><circle cx="19.5" cy="16.3" r="0.5" fill="white"/><path d="M 13 20.5 Q 16 23 19 20.5" stroke="#a16207" strokeWidth="1.1" fill="none" strokeLinecap="round"/></svg>,

  // 7: Blonde bob, round glasses
  () => <svg viewBox="0 0 32 32" fill="none" className="w-full h-full"><circle cx="16" cy="16" r="16" fill="#d97706"/><rect x="9" y="24" width="14" height="8" rx="3" fill="#059669"/><circle cx="16" cy="17" r="7.5" fill="#FFE4C4"/><path d="M 7 15 Q 9 8 16 9 Q 23 8 25 15 Q 24 12 16 12 Q 8 12 7 15" fill="#fbbf24"/><rect x="6.5" y="14" width="4" height="8" rx="2" fill="#fbbf24"/><rect x="21.5" y="14" width="4" height="8" rx="2" fill="#fbbf24"/><circle cx="13" cy="17" r="3" stroke="#92400e" strokeWidth="1" fill="none" opacity="0.85"/><circle cx="19" cy="17" r="3" stroke="#92400e" strokeWidth="1" fill="none" opacity="0.85"/><line x1="14.5" y1="16.8" x2="16.5" y2="16.8" stroke="#92400e" strokeWidth="1" opacity="0.85"/><circle cx="13" cy="17" r="1.1" fill="#374151"/><circle cx="19" cy="17" r="1.1" fill="#374151"/><circle cx="13.5" cy="16.3" r="0.4" fill="white"/><circle cx="19.5" cy="16.3" r="0.4" fill="white"/><path d="M 13 21 Q 16 23.5 19 21" stroke="#a16207" strokeWidth="1.1" fill="none" strokeLinecap="round"/></svg>,

  // 8: Pink twin pigtails, anime eyes
  () => <svg viewBox="0 0 32 32" fill="none" className="w-full h-full"><circle cx="16" cy="16" r="16" fill="#be185d"/><rect x="9" y="24" width="14" height="8" rx="3" fill="#f9a8d4"/><circle cx="7" cy="14" r="5" fill="#ec4899"/><circle cx="25" cy="14" r="5" fill="#ec4899"/><circle cx="9.5" cy="14" r="1.5" fill="#fbbf24"/><circle cx="22.5" cy="14" r="1.5" fill="#fbbf24"/><circle cx="16" cy="17" r="7.5" fill="#FFE4C4"/><path d="M 8 15 Q 12 9 16 10 Q 20 9 24 15 Q 22 11 16 11 Q 10 11 8 15" fill="#f472b6"/><ellipse cx="13" cy="17" rx="2" ry="2.2" fill="#e879f9"/><ellipse cx="19" cy="17" rx="2" ry="2.2" fill="#e879f9"/><ellipse cx="13" cy="17" rx="1" ry="1.1" fill="#1a1a2e"/><ellipse cx="19" cy="17" rx="1" ry="1.1" fill="#1a1a2e"/><circle cx="12.5" cy="16" r="0.6" fill="white"/><circle cx="18.5" cy="16" r="0.6" fill="white"/><path d="M 13.5 21 Q 16 23 18.5 21" stroke="#c87040" strokeWidth="1.1" fill="none" strokeLinecap="round"/><ellipse cx="11" cy="20" rx="2" ry="1" fill="#ffb3ba" opacity="0.7"/><ellipse cx="21" cy="20" rx="2" ry="1" fill="#ffb3ba" opacity="0.7"/></svg>,

  // 9: Dark skin, curly hair, cool sunglasses
  () => <svg viewBox="0 0 32 32" fill="none" className="w-full h-full"><circle cx="16" cy="16" r="16" fill="#451a03"/><rect x="9" y="24" width="14" height="8" rx="3" fill="#f97316"/><circle cx="16" cy="17" r="7.5" fill="#4A2512"/><circle cx="12" cy="12" r="3.5" fill="#111"/><circle cx="16" cy="11" r="3.5" fill="#111"/><circle cx="20" cy="12" r="3.5" fill="#111"/><ellipse cx="16" cy="13" rx="7.5" ry="4" fill="#111"/><rect x="9" y="15" width="6" height="3.5" rx="1.5" fill="#111" opacity="0.95"/><rect x="17" y="15" width="6" height="3.5" rx="1.5" fill="#111" opacity="0.95"/><line x1="15" y1="16.7" x2="17" y2="16.7" stroke="#555" strokeWidth="1"/><path d="M 12.5 22 Q 16 24.5 19.5 22" stroke="#2d1500" strokeWidth="1.2" fill="none" strokeLinecap="round"/></svg>,

  // 10: Medium skin, backwards cap
  () => <svg viewBox="0 0 32 32" fill="none" className="w-full h-full"><circle cx="16" cy="16" r="16" fill="#1e3a5f"/><rect x="9" y="24" width="14" height="8" rx="3" fill="#1d4ed8"/><circle cx="16" cy="17" r="7.5" fill="#DEB887"/><rect x="8" y="15" width="2.5" height="6" rx="1.2" fill="#2d1a0e"/><rect x="21.5" y="15" width="2.5" height="6" rx="1.2" fill="#2d1a0e"/><ellipse cx="16" cy="11" rx="9" ry="5" fill="#2563eb"/><rect x="6" y="14" width="4" height="2.5" rx="1.2" fill="#1d4ed8"/><line x1="8" y1="12" x2="24" y2="12" stroke="#1d4ed8" strokeWidth="0.8"/><circle cx="16" cy="7" r="1.2" fill="#1e40af"/><circle cx="13" cy="17.5" r="1.4" fill="#2d1a0e"/><circle cx="19" cy="17.5" r="1.4" fill="#2d1a0e"/><circle cx="13.5" cy="16.8" r="0.5" fill="white"/><circle cx="19.5" cy="16.8" r="0.5" fill="white"/><path d="M 13 21 Q 16 23.5 19 21" stroke="#a07040" strokeWidth="1.1" fill="none" strokeLinecap="round"/></svg>,

  // 11: Green frog alien
  () => <svg viewBox="0 0 32 32" fill="none" className="w-full h-full"><circle cx="16" cy="16" r="16" fill="#14532d"/><rect x="9" y="23" width="14" height="9" rx="3" fill="#16a34a"/><circle cx="16" cy="17" r="8" fill="#4ade80"/><circle cx="11" cy="11" r="4" fill="#16a34a"/><circle cx="21" cy="11" r="4" fill="#16a34a"/><circle cx="11" cy="11" r="2.5" fill="white"/><circle cx="21" cy="11" r="2.5" fill="white"/><circle cx="11.5" cy="11" r="1.3" fill="#111"/><circle cx="21.5" cy="11" r="1.3" fill="#111"/><circle cx="11.8" cy="10.3" r="0.5" fill="white"/><circle cx="21.8" cy="10.3" r="0.5" fill="white"/><path d="M 11 21 Q 16 25 21 21" stroke="#166534" strokeWidth="1.5" fill="none" strokeLinecap="round"/><circle cx="14.5" cy="19" r="0.7" fill="#22c55e" opacity="0.7"/><circle cx="17.5" cy="19" r="0.7" fill="#22c55e" opacity="0.7"/></svg>,

  // 12: Flame hair avatar
  () => <svg viewBox="0 0 32 32" fill="none" className="w-full h-full"><circle cx="16" cy="16" r="16" fill="#7f1d1d"/><rect x="9" y="24" width="14" height="8" rx="3" fill="#dc2626"/><circle cx="16" cy="18" r="7.5" fill="#FFD5B5"/><path d="M 9 15 Q 8 6 13 8 Q 10 3 16 2 Q 22 3 19 8 Q 24 6 23 15" fill="#f97316"/><path d="M 11 14 Q 11 8 14 9 Q 12 5 16 5 Q 20 5 18 9 Q 21 8 21 14" fill="#fbbf24"/><path d="M 13 14 Q 14 10 16 9 Q 18 10 19 14" fill="#fef3c7"/><circle cx="13" cy="18" r="1.5" fill="#c2410c"/><circle cx="19" cy="18" r="1.5" fill="#c2410c"/><circle cx="13.5" cy="17.3" r="0.5" fill="white"/><circle cx="19.5" cy="17.3" r="0.5" fill="white"/><path d="M 13 22 Q 16 24.5 19 22" stroke="#a16207" strokeWidth="1.1" fill="none" strokeLinecap="round"/></svg>,

  // 13: Pale gothic, long black hair, violet eyes
  () => <svg viewBox="0 0 32 32" fill="none" className="w-full h-full"><circle cx="16" cy="16" r="16" fill="#0a0a0a"/><rect x="9" y="23" width="14" height="9" rx="3" fill="#1a1a1a"/><rect x="5" y="12" width="5" height="18" rx="2.5" fill="#0d0d0d"/><rect x="22" y="12" width="5" height="18" rx="2.5" fill="#0d0d0d"/><ellipse cx="16" cy="13" rx="9" ry="7" fill="#111"/><circle cx="16" cy="17" r="7.5" fill="#F0F0F5"/><path d="M 7 14 Q 11 8 16 10 Q 21 8 25 14 Q 22 10 16 11 Q 10 10 7 14" fill="#0d0d0d"/><circle cx="13" cy="17" r="2" fill="white"/><circle cx="19" cy="17" r="2" fill="white"/><circle cx="13" cy="17" r="1.2" fill="#6d28d9"/><circle cx="19" cy="17" r="1.2" fill="#6d28d9"/><circle cx="13" cy="17" r="0.5" fill="#111"/><circle cx="19" cy="17" r="0.5" fill="#111"/><circle cx="13.4" cy="16.4" r="0.4" fill="white"/><circle cx="19.4" cy="16.4" r="0.4" fill="white"/><path d="M 13.5 21.5 Q 16 22.5 18.5 21.5" stroke="#888" strokeWidth="0.9" fill="none" strokeLinecap="round"/></svg>,

  // 14: Pink beret, brown braids, rosy cheeks
  () => <svg viewBox="0 0 32 32" fill="none" className="w-full h-full"><circle cx="16" cy="16" r="16" fill="#9d174d"/><rect x="9" y="24" width="14" height="8" rx="3" fill="#f43f5e"/><rect x="5.5" y="16" width="4.5" height="13" rx="2.2" fill="#7c3f1e"/><rect x="22" y="16" width="4.5" height="13" rx="2.2" fill="#7c3f1e"/><circle cx="7.7" cy="17.5" r="1.2" fill="#fb7185"/><circle cx="24.2" cy="17.5" r="1.2" fill="#fb7185"/><circle cx="16" cy="17" r="7.5" fill="#FFE4C4"/><path d="M 8 14 Q 11 10 16 11 Q 21 10 24 14 Q 22 11 16 12 Q 10 11 8 14" fill="#7c3f1e"/><ellipse cx="16" cy="10.5" rx="9" ry="4.5" fill="#f43f5e"/><ellipse cx="16" cy="9.5" rx="7" ry="3.5" fill="#fb7185"/><circle cx="19.5" cy="8" r="2" fill="#f43f5e"/><circle cx="13" cy="17" r="1.5" fill="#7c3aed"/><circle cx="19" cy="17" r="1.5" fill="#7c3aed"/><circle cx="13.5" cy="16.3" r="0.5" fill="white"/><circle cx="19.5" cy="16.3" r="0.5" fill="white"/><path d="M 13 20.5 Q 16 23 19 20.5" stroke="#c87040" strokeWidth="1.1" fill="none" strokeLinecap="round"/><ellipse cx="11" cy="19.5" rx="1.8" ry="1" fill="#ffb3ba" opacity="0.6"/><ellipse cx="21" cy="19.5" rx="1.8" ry="1" fill="#ffb3ba" opacity="0.6"/></svg>,
];

// Stable reference — same array identity across all renders
const EXCLUDE_CELLS = BLURBS.map(b => ({ col: b.col, row: b.row }));

function BlurbCard({
  blurb,
  progress,
  targetPositions,
  hexSize,
}: {
  blurb: Blurb;
  progress: MotionValue<number>;
  targetPositions: React.RefObject<{ tx: number; ty: number }[]>;
  hexSize: { w: number; h: number };
}) {
  // Position: custom eased interpolation reading exact targets from ref
  const x = useTransform(progress, (p: number) => {
    const tx = targetPositions.current[blurb.id]?.tx ?? 300;
    if (p <= 0.08) return blurb.ix;
    if (p >= 0.76) return tx;
    return blurb.ix + (tx - blurb.ix) * easeInOut((p - 0.08) / 0.68);
  });
  const y = useTransform(progress, (p: number) => {
    const ty = targetPositions.current[blurb.id]?.ty ?? 0;
    if (p <= 0.08) return blurb.iy;
    if (p >= 0.76) return ty;
    return blurb.iy + (ty - blurb.iy) * easeInOut((p - 0.08) / 0.68);
  });

  const cardOpacity = useTransform(progress, [0.05, 0.28], [1, 0]);
  const cardScale   = useTransform(progress, [0.06, 0.32], [1, 0.04]);
  // Hexes fade in as card shrinks, then stay permanently to fill blank heatmap cells
  const hexOpacity = useTransform(progress, [0.12, 0.30], [0, 1]);
  const hexScale   = useTransform(progress, [0.12, 0.30], [0.3, 1]);

  return (
    // Zero-size anchor: left/top 50% is exactly viewport centre + x,y offset.
    // Card and hex are absolutely placed with explicit px offsets from this anchor.
    <motion.div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 0,
        height: 0,
        x, y,
        zIndex: 10,
      }}
    >
      {/* Card with idle float — shrinks into hex as scroll starts */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 3.2 + blurb.floatDelay * 0.35,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: blurb.floatDelay * 0.45,
        }}
        style={{
          position: 'absolute',
          left: -125,
          top: -58,
          opacity: cardOpacity,
          scale: cardScale,
        }}
        className="w-[250px] pointer-events-none"
      >
        <div className="bg-[#111111]/95 backdrop-blur-sm border border-[#1f1f1f] rounded-xl p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full flex-shrink-0 mt-0.5 overflow-hidden">
              {AVATARS[blurb.id % AVATARS.length]()}
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

      {/* Hex — centered exactly on anchor, flies to heatmap cell, stays permanently */}
      {(() => {
        const [cellFill, cellOpacity] = getCellColor(blurb.col, blurb.row);
        return (
          <motion.div
            style={{
              position: 'absolute',
              left: -(hexSize.w / 2),
              top: -(hexSize.h / 2),
              opacity: hexOpacity,
              scale: hexScale,
            }}
          >
            <svg
              width={hexSize.w}
              height={hexSize.h}
              viewBox="-11 -9.526 22 19.052"
              style={{ overflow: 'visible', display: 'block' }}
            >
              <path d={HEX_PATH} fill={cellFill} opacity={cellOpacity} />
            </svg>
          </motion.div>
        );
      })()}
    </motion.div>
  );
}

export function LandingHero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [hasUserEditedInput, setHasUserEditedInput] = useState(false);
  const [shouldRenderSearchBar, setShouldRenderSearchBar] = useState(false);
  const [isSearchPersistent, setIsSearchPersistent] = useState(false);
  const [hasStartedSearchCycle, setHasStartedSearchCycle] = useState(false);
  const [isRapidCycling, setIsRapidCycling] = useState(false);
  // Cell display size — updated once SVG is measured, triggers BlurbCard re-render
  const [hexSize, setHexSize] = useState({ w: 22, h: 19 });
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const heatmapSvgRef = useRef<SVGSVGElement>(null);
  const stickyRef     = useRef<HTMLDivElement>(null);

  // Ref (not state) so BlurbCards always read latest values without re-render
  const targetPositions = useRef<{ tx: number; ty: number }[]>(
    BLURBS.map(() => ({ tx: 300, ty: 0 }))
  );

  // Measure exact cell positions after the SVG is in the DOM
  useEffect(() => {
    const measure = () => {
      const svgEl = heatmapSvgRef.current;
      if (!svgEl) return;

      const rect = svgEl.getBoundingClientRect();
      if (rect.width === 0) return; // not yet laid out

      const svgScale = rect.width / SVG_VIEW_W;
      // Use sticky viewport bounds — NOT window.innerWidth/Height.
      // At scroll=0 the sticky div is offset by the Header height (~80px), so
      // window.innerHeight/2 would be wrong; stickyRect.top absorbs that offset
      // and the math cancels correctly once the sticky element locks to top=0.
      const stickyRect = stickyRef.current?.getBoundingClientRect();
      if (!stickyRect) return;
      const vpCx = stickyRect.left + stickyRect.width  / 2;
      const vpCy = stickyRect.top  + stickyRect.height / 2;

      BLURBS.forEach(b => {
        // Exact SVG coordinates of the target hex cell center
        const svgX = HEX_R + b.col * COL_SPACING;
        const svgY = HEX_R + b.row * ROW_SPACING + (b.col % 2 === 1 ? ROW_SPACING / 2 : 0);

        // Convert to viewport coords, then to center-relative (for motion x/y)
        const vpX = rect.left + svgX * svgScale;
        const vpY = rect.top  + svgY * svgScale;

        targetPositions.current[b.id] = {
          tx: vpX - vpCx,
          ty: vpY - vpCy,
        };
      });

      // Cell display size: hex path spans 22×19.052 in viewBox units
      setHexSize({
        w: Math.max(8, Math.round(22 * svgScale)),
        h: Math.max(7, Math.round(19.052 * svgScale)),
      });
    };

    // Measure once layout is complete
    requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  // Cinematic lag so hex transitions remain smooth even on fast scroll gestures.
  const cinematicProgress = useSpring(scrollYProgress, {
    stiffness: 55,
    damping: 24,
    mass: 1.8,
  });

  const threadOpacity   = useTransform(cinematicProgress, [0, 0.12], [0.5, 0]);
  // Title fades out during animation, fades back in when hexes land (~0.76), then stays
  const titleOpacity    = useTransform(cinematicProgress, [0, 0.06, 0.20, 0.32, 0.76, 0.84], [1, 1, 1, 0, 0, 1]);
  const titleY          = useTransform(cinematicProgress, [0.20, 0.32, 0.76, 0.84], [0, -10, 10, 0]);
  const labelOpacity    = useTransform(cinematicProgress, [0.30, 0.44, 0.74, 0.80], [0, 1, 1, 0]);
  const heatmapOpacity  = useTransform(cinematicProgress, [0.52, 0.80], [0, 1]);
  const hintOpacity     = useTransform(cinematicProgress, [0, 0.06], [1, 0]);
  // Search bar fades in as hexes land, stays at full opacity — no fade-out
  const searchBarOpacity = useTransform(cinematicProgress, [0.78, 0.86], [0, 1]);

  useMotionValueEvent(cinematicProgress, 'change', (value) => {
    if (value >= 0.78 && !hasStartedSearchCycle) {
      setShouldRenderSearchBar(true);
      setHasStartedSearchCycle(true);
      setIsRapidCycling(true);
    }
    if (value >= 0.86) {
      setIsSearchPersistent(true);
    }
  });

  useEffect(() => {
    if (!isRapidCycling || isSearchFocused) return;

    const spinDelaysMs = [70, 70, 90, 130, 200];
    let stepCount = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const tick = () => {
      setCurrentIndex((p) => (p + 1) % trendingSearches.length);
      stepCount += 1;
      if (stepCount >= spinDelaysMs.length) {
        setIsRapidCycling(false);
        return;
      }
      timeoutId = setTimeout(tick, spinDelaysMs[stepCount]);
    };

    timeoutId = setTimeout(tick, spinDelaysMs[0]);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isRapidCycling, isSearchFocused]);

  useEffect(() => {
    if (!hasStartedSearchCycle || isRapidCycling || isSearchFocused) return;
    const interval = setInterval(() => {
      setCurrentIndex((p) => (p + 1) % trendingSearches.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [hasStartedSearchCycle, isRapidCycling, isSearchFocused]);

  const currentSearch = trendingSearches[currentIndex];
  useEffect(() => {
    if (!hasUserEditedInput && !isSearchFocused) {
      setSearchInput(currentSearch.term);
    }
  }, [currentSearch.term, hasUserEditedInput, isSearchFocused]);

  const handleExplore = () => {
    const raw = searchInput.trim() || currentSearch.term;
    const slug = queryParamToSlug(raw);
    if (!slug) return;
    navigate(`/search/${slug}`);
  };

  return (
    <main className="relative">

      {/* ── SCROLL ANIMATION SECTION ── */}
      <div ref={containerRef} style={{ height: '320vh' }}>
        <div ref={stickyRef} style={{ position: 'sticky', top: 0, height: '100vh' }} className="overflow-hidden relative bg-[#0a0a0a]">

          {/* Red-dot network background */}
          <div className="absolute inset-0">
            <motion.svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1400 700"
              preserveAspectRatio="xMidYMid slice"
              initial={{ x: 0 }}
              animate={{ x: -200 }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            >
              <defs>
                <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </radialGradient>
              </defs>
              <g opacity="0.1">
                <line x1="80" y1="65" x2="145" y2="110" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="145" y1="110" x2="230" y2="85" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="230" y1="85" x2="310" y2="140" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="310" y1="140" x2="420" y2="95" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="145" y1="110" x2="180" y2="175" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="180" y1="175" x2="285" y2="160" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="420" y1="95" x2="520" y2="125" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="520" y1="125" x2="610" y2="90" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="610" y1="90" x2="695" y2="155" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="695" y1="155" x2="780" y2="110" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="180" y1="175" x2="120" y2="245" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="120" y1="245" x2="210" y2="280" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="210" y1="280" x2="335" y2="250" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="285" y1="160" x2="365" y2="220" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="365" y1="220" x2="460" y2="195" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="460" y1="195" x2="555" y2="240" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="555" y1="240" x2="640" y2="205" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="640" y1="205" x2="730" y2="260" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="730" y1="260" x2="820" y2="225" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="210" y1="280" x2="175" y2="350" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="175" y1="350" x2="270" y2="380" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="270" y1="380" x2="380" y2="340" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="380" y1="340" x2="490" y2="310" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="490" y1="310" x2="575" y2="365" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="575" y1="365" x2="670" y2="330" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="670" y1="330" x2="755" y2="385" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="755" y1="385" x2="850" y2="340" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="270" y1="380" x2="230" y2="465" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="230" y1="465" x2="325" y2="490" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="325" y1="490" x2="435" y2="455" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="435" y1="455" x2="525" y2="500" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="525" y1="500" x2="620" y2="470" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="620" y1="470" x2="710" y2="520" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="710" y1="520" x2="800" y2="485" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="850" y1="340" x2="940" y2="120" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="940" y1="120" x2="1030" y2="175" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="1030" y1="175" x2="1120" y2="140" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="1120" y1="140" x2="1210" y2="195" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="940" y1="120" x2="920" y2="250" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="920" y1="250" x2="1015" y2="280" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="1015" y1="280" x2="1105" y2="245" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="1105" y1="245" x2="1195" y2="295" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="920" y1="250" x2="880" y2="370" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="880" y1="370" x2="970" y2="405" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="970" y1="405" x2="1065" y2="370" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="1065" y1="370" x2="1150" y2="420" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="880" y1="370" x2="860" y2="495" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="860" y1="495" x2="950" y2="530" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="950" y1="530" x2="1040" y2="495" stroke="#ef4444" strokeWidth="0.5" />
                <line x1="1040" y1="495" x2="1130" y2="540" stroke="#ef4444" strokeWidth="0.5" />
              </g>
              <g>
                <circle cx="80" cy="65" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="145" cy="110" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="230" cy="85" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="310" cy="140" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="420" cy="95" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="520" cy="125" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="610" cy="90" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="695" cy="155" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="780" cy="110" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="180" cy="175" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="120" cy="245" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="210" cy="280" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="285" cy="160" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="335" cy="250" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="365" cy="220" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="460" cy="195" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="555" cy="240" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="640" cy="205" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="730" cy="260" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="820" cy="225" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="175" cy="350" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="270" cy="380" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="380" cy="340" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="490" cy="310" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="575" cy="365" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="670" cy="330" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="755" cy="385" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="850" cy="340" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="230" cy="465" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="325" cy="490" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="435" cy="455" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="525" cy="500" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="620" cy="470" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="710" cy="520" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="800" cy="485" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="940" cy="120" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="1030" cy="175" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="1120" cy="140" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="1210" cy="195" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="920" cy="250" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="1015" cy="280" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="1105" cy="245" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="1195" cy="295" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="880" cy="370" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="970" cy="405" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="1065" cy="370" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="1150" cy="420" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="860" cy="495" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="950" cy="530" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="1040" cy="495" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="1130" cy="540" r="3" fill="#ef4444" opacity="0.7" />
                <circle cx="460" cy="195" r="6" fill="url(#nodeGlow)" />
                <circle cx="460" cy="195" r="3" fill="#ef4444" />
                <circle cx="670" cy="330" r="6" fill="url(#nodeGlow)" />
                <circle cx="670" cy="330" r="3" fill="#ef4444" />
                <circle cx="1030" cy="175" r="6" fill="url(#nodeGlow)" />
                <circle cx="1030" cy="175" r="3" fill="#ef4444" />
              </g>
            </motion.svg>
          </div>

          {/* Thread lines — dashed, connect blurb to nearest red dot, fade on scroll */}
          <motion.svg
            style={{ opacity: threadOpacity }}
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1400 700"
            preserveAspectRatio="xMidYMid slice"
          >
            {BLURBS.map(b => (
              <line
                key={b.id}
                x1={700 + b.ix} y1={350 + b.iy}
                x2={700 + b.tEx} y2={350 + b.tEy}
                stroke="#ef4444"
                strokeWidth="0.7"
                strokeDasharray="4 5"
              />
            ))}
          </motion.svg>

          {/* Blurb cards → hexagons */}
          {BLURBS.map(b => (
            <BlurbCard
              key={b.id}
              blurb={b}
              progress={cinematicProgress}
              targetPositions={targetPositions}
              hexSize={hexSize}
            />
          ))}

          {/* Heatmap — centered, fades in as hexes arrive */}
          <motion.div
            style={{ opacity: heatmapOpacity, top: '50%', y: '-50%' }}
            className="absolute inset-x-6 md:inset-x-12 z-0"
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
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-[#4b5563]">Low</span>
                  <div
                    className="w-20 h-[5px] rounded-full"
                    style={{ background: 'linear-gradient(to right, #08104a, #1a3aaf, #6014aa, #c41230, #e85d04, #ffd166)' }}
                  />
                  <span className="text-[10px] text-[#4b5563]">High</span>
                </div>
              </div>
              <HexHeatmap svgRef={heatmapSvgRef} excludeCells={EXCLUDE_CELLS} className="w-full" />
            </div>
          </motion.div>

          {/* Title — visible on load, fades during hex convergence, returns with search bar */}
          <motion.div
            style={{ opacity: titleOpacity, y: titleY }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 pointer-events-none"
          >
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
              className="w-full max-w-[680px] mx-auto flex flex-col items-center"
            >
              <h1 className="text-[52px] font-[600] text-white tracking-[-0.02em] leading-[1.2] mb-4 text-center">
                Skip the rabbit hole,<br />
                <span className="text-[#a1a1a1]">get the consensus</span>
              </h1>
              <p className="text-[15px] text-[#6b7280] leading-[1.6] text-center max-w-[420px] mx-auto mb-10">
                Personalized recommendations from millions of real people
              </p>

            </motion.div>
          </motion.div>

          {/* "What Reddit says" label */}
          <motion.p
            style={{ opacity: labelOpacity }}
            className="absolute top-8 left-0 right-0 text-center z-30 pointer-events-none
                       text-[12px] text-[#6b7280] uppercase tracking-[0.14em] font-medium"
          >
            What Reddit says about creatine
          </motion.p>

          {/* Footer — always visible at bottom of sticky viewport */}
          <p className="absolute bottom-3 left-0 right-0 text-center text-[11px] text-[#2a2a2a] pointer-events-none z-10">
            Reddit PhD aggregates real user experiences. Not medical advice.
          </p>

          {/* Scroll hint */}
          <motion.div
            style={{ opacity: hintOpacity }}
            className="absolute bottom-7 left-0 right-0 flex flex-col items-center gap-1.5 pointer-events-none z-30"
          >
            <span className="text-[10px] text-[#4b5563] uppercase tracking-widest">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-px h-5 bg-gradient-to-b from-[#4b5563] to-transparent"
            />
          </motion.div>

        </div>
      </div>

      {/* Persistent search bar — remains visible past sticky section */}
      {shouldRenderSearchBar && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ y: 0 }}
          style={{ opacity: isSearchPersistent ? 1 : searchBarOpacity }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed left-1/2 -translate-x-1/2 top-[62vh] w-[min(860px,calc(100vw-1.5rem))] z-40 pointer-events-auto"
        >
          <div className={`relative bg-[#0f0f10]/95 rounded-full border-2 transition-all duration-200 mb-7 ${isSearchFocused ? 'border-[#8b5cf6] shadow-[0_0_40px_rgba(124,58,237,0.45)]' : 'border-[#2b2b31] shadow-[0_10px_40px_rgba(0,0,0,0.45)]'}`}>
            <div className="flex items-center px-8 py-5">
              <div className="w-6 h-6 mr-5 flex-shrink-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ duration: 0.4 }}
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: currentSearch.color }}
                  />
                </AnimatePresence>
              </div>
              <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => {
                        setSearchInput(e.target.value);
                        setHasUserEditedInput(true);
                      }}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleExplore();
                        }
                      }}
                      className="w-full bg-transparent border-none outline-none text-[20px] font-medium text-white"
                      placeholder={currentSearch.term}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
              <button
                className="ml-5 px-7 py-3 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-full transition-colors text-[16px] font-semibold shadow-[0_8px_24px_rgba(124,58,237,0.45)]"
                onClick={handleExplore}
              >
                Explore
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            {trendingSearches.map((_, i) => (
              <button key={i} onClick={() => setCurrentIndex(i)} className="group p-1">
                <div className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-[#7c3aed]' : 'w-2 bg-[#404040] group-hover:bg-[#6b7280]'}`} />
              </button>
            ))}
          </div>
        </motion.div>
      )}

    </main>
  );
}
