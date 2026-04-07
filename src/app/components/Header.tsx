import { Link } from 'react-router';

export function Header() {
  return (
    <header className="border-b border-[#1f1f1f]">
      <div className="max-w-[1400px] mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            {/* Classic Snoo logo */}
            <div className="w-[34px] h-[34px]">
              <svg viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Antenna stem */}
                <line x1="62" y1="14" x2="74" y2="4" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round"/>
                {/* Antenna ball */}
                <circle cx="78" cy="3" r="5" stroke="#1a1a1a" strokeWidth="3.5" fill="white"/>
                {/* Head */}
                <ellipse cx="50" cy="38" rx="28" ry="26" fill="white" stroke="#1a1a1a" strokeWidth="4.5"/>
                {/* Ears */}
                <ellipse cx="22" cy="34" rx="7" ry="9" fill="white" stroke="#1a1a1a" strokeWidth="4"/>
                <ellipse cx="78" cy="34" rx="7" ry="9" fill="white" stroke="#1a1a1a" strokeWidth="4"/>
                {/* Eyes */}
                <circle cx="40" cy="36" r="6" fill="#FF4500"/>
                <circle cx="60" cy="36" r="6" fill="#FF4500"/>
                {/* Smile */}
                <path d="M 37 47 Q 50 56 63 47" stroke="#1a1a1a" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                {/* Body */}
                <rect x="34" y="63" width="32" height="28" rx="14" fill="white" stroke="#1a1a1a" strokeWidth="4.5"/>
                {/* Arms */}
                <path d="M 34 70 Q 18 68 16 80 Q 14 90 26 88" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" fill="none"/>
                <path d="M 66 70 Q 82 68 84 80 Q 86 90 74 88" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" fill="none"/>
                {/* Feet */}
                <ellipse cx="40" cy="93" rx="10" ry="7" fill="white" stroke="#1a1a1a" strokeWidth="4"/>
                <ellipse cx="60" cy="93" rx="10" ry="7" fill="white" stroke="#1a1a1a" strokeWidth="4"/>
              </svg>
            </div>
            
            <h1 className="text-[17px] font-semibold tracking-[-0.01em] text-white">Reddit PhD</h1>
          </Link>
          <nav className="flex items-center gap-8">
            <a href="#" className="text-[14px] text-[#a1a1a1] hover:text-white transition-colors">About</a>
            <a href="#" className="text-[14px] text-[#a1a1a1] hover:text-white transition-colors">Methodology</a>
          </nav>
        </div>
      </div>
    </header>
  );
}