import { Link } from 'react-router';

export function Header() {
  return (
    <header className="border-b border-[#1f1f1f]">
      <div className="max-w-[1400px] mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            {/* Reddit PhD Logo with Graduation Hat */}
            <div className="relative w-[32px] h-[32px]">
              {/* Reddit alien head */}
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Head */}
                <circle cx="16" cy="18" r="10" fill="#FF4500"/>
                
                {/* Antenna */}
                <line x1="16" y1="8" x2="16" y2="4" stroke="#FF4500" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="16" cy="3" r="2" fill="#FF4500"/>
                
                {/* Eyes */}
                <circle cx="12" cy="17" r="1.5" fill="white"/>
                <circle cx="20" cy="17" r="1.5" fill="white"/>
                
                {/* Smile */}
                <path d="M 12 20 Q 16 22 20 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                
                {/* PhD Graduation Cap */}
                {/* Cap top (mortarboard) */}
                <rect x="10" y="11" width="12" height="1.5" fill="#a78bfa" rx="0.5"/>
                <path d="M 9 11 L 23 11 L 22 9 L 10 9 Z" fill="#a78bfa"/>
                
                {/* Tassel */}
                <line x1="22" y1="9" x2="24" y2="7" stroke="#a78bfa" strokeWidth="1" strokeLinecap="round"/>
                <circle cx="24.5" cy="6.5" r="1" fill="#a78bfa"/>
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