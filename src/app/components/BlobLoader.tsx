import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/** Snoo SVG — orange circle + white face, designed to merge nicely via goo filter */
function SnooIcon({ size }: { size: number }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {/* Orange background */}
      <circle cx="22" cy="22" r="22" fill="#FF4500" />
      {/* Antenna */}
      <line x1="22" y1="8" x2="22" y2="4" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="22" cy="2.5" r="2.5" fill="white" />
      {/* Ears */}
      <circle cx="8" cy="24" r="4.5" fill="white" />
      <circle cx="36" cy="24" r="4.5" fill="white" />
      {/* Face oval */}
      <ellipse cx="22" cy="27" rx="14" ry="12" fill="white" />
      {/* Eyes */}
      <circle cx="17" cy="24" r="3.2" fill="#FF4500" />
      <circle cx="27" cy="24" r="3.2" fill="#FF4500" />
      {/* Eye shine */}
      <circle cx="15.8" cy="23" r="1.3" fill="white" />
      <circle cx="25.8" cy="23" r="1.3" fill="white" />
      {/* Smile */}
      <path d="M 15 30 Q 22 35 29 30" stroke="#FF4500" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function BlobLoader({ visible, minMs = 2200 }: { visible: boolean; minMs?: number }) {
  const [show, setShow] = useState(false);
  const [exit, setExit] = useState(false);
  const startRef = useRef(0);

  useEffect(() => {
    if (visible) {
      setShow(true);
      setExit(false);
      startRef.current = Date.now();
    } else if (show) {
      const elapsed = Date.now() - startRef.current;
      const wait = Math.max(0, minMs - elapsed);
      const t = setTimeout(() => setExit(true), wait);
      return () => clearTimeout(t);
    }
  }, [visible, show, minMs]);

  return (
    <AnimatePresence onExitComplete={() => setShow(false)}>
      {show && !exit && (
        <motion.div
          key="blob-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: '#080c09',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 52,
          }}
        >
          {/* Scanlines */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(20,184,166,0.025) 3px, rgba(20,184,166,0.025) 4px)',
          }} />

          {/* Goo filter — makes orange circles merge when they overlap */}
          <svg style={{ position: 'absolute', width: 0, height: 0 }}>
            <defs>
              <filter id="snoo-goo" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
                <feColorMatrix
                  in="blur" mode="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
                  result="goo"
                />
              </filter>
            </defs>
          </svg>

          <style>{`
            @keyframes snooOrbit1 { from { transform: rotate(0deg);   } to { transform: rotate(360deg);  } }
            @keyframes snooOrbit2 { from { transform: rotate(120deg); } to { transform: rotate(480deg);  } }
            @keyframes snooOrbit3 { from { transform: rotate(240deg); } to { transform: rotate(600deg);  } }
            @keyframes snooSquish {
              0%   { border-radius: 50%; transform: translateX(-50%) scale(1); }
              25%  { border-radius: 58% 42% 52% 48% / 46% 54% 46% 54%; transform: translateX(-50%) scale(1.1, 0.92); }
              50%  { border-radius: 44% 56% 48% 52% / 54% 46% 54% 46%; transform: translateX(-50%) scale(0.93, 1.08); }
              75%  { border-radius: 52% 48% 44% 56% / 50% 50% 50% 50%; transform: translateX(-50%) scale(1.06, 0.95); }
              100% { border-radius: 50%; transform: translateX(-50%) scale(1); }
            }
          `}</style>

          {/* Layer 1: Orange circles only — goo filter merges them */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ position: 'relative' }}
          >
            <div style={{ position: 'relative', width: 160, height: 160, filter: 'url(#snoo-goo)' }}>
              {[
                { anim: 'snooOrbit1', dur: '2.0s' },
                { anim: 'snooOrbit2', dur: '2.7s' },
                { anim: 'snooOrbit3', dur: '3.5s' },
              ].map((orbit, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute', inset: 0,
                    animation: `${orbit.anim} ${orbit.dur} linear infinite`,
                  }}
                >
                  {/* Pure orange circle — this is what the goo filter blobs/merges */}
                  <div style={{
                    position: 'absolute',
                    top: '14px',
                    left: '50%',
                    width: 46, height: 46,
                    borderRadius: '50%',
                    background: '#FF4500',
                    animation: `snooSquish ${2.2 + i * 0.4}s ease-in-out infinite`,
                    animationDelay: `${i * -0.5}s`,
                  }} />
                </div>
              ))}
            </div>

            {/* Layer 2: Snoo face details — same orbit, NO filter, laid over the orange blobs */}
            <div style={{ position: 'absolute', inset: 0, width: 160, height: 160 }}>
              {[
                { anim: 'snooOrbit1', dur: '2.0s' },
                { anim: 'snooOrbit2', dur: '2.7s' },
                { anim: 'snooOrbit3', dur: '3.5s' },
              ].map((orbit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.12, duration: 0.3 }}
                  style={{
                    position: 'absolute', inset: 0,
                    animation: `${orbit.anim} ${orbit.dur} linear infinite`,
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '14px',
                    left: '50%',
                    width: 46, height: 46,
                    transform: 'translateX(-50%)',
                    borderRadius: '50%',
                    overflow: 'hidden',
                  }}>
                    <SnooIcon size={46} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            style={{
              color: '#5eead4', fontSize: 13,
              letterSpacing: '0.12em',
              fontFamily: 'inherit',
              textTransform: 'uppercase',
            }}
          >
            Analyzing Reddit…
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
