# Reddit PhD - Complete Setup Guide for Cursor

## 📦 Step 1: Create New Vite Project

```bash
npm create vite@latest reddit-phd -- --template react-ts
cd reddit-phd
```

## 📚 Step 2: Install Dependencies

```bash
npm install react-router@7.13.0 motion@12.23.24 lucide-react@0.487.0 recharts@2.15.2 clsx tailwind-merge
npm install -D tailwindcss@4.1.12 @tailwindcss/vite@4.1.12
```

## 🎨 Step 3: Configure Vite (vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

## 💅 Step 4: Update src/index.css

```css
@import 'tailwindcss';

@layer base {
  body {
    @apply bg-[#0a0a0a] text-white;
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
  }
}
```

## 📄 Step 5: Create src/main.tsx

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

## 🚀 Step 6: Create src/App.tsx

```typescript
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return <RouterProvider router={router} />;
}
```

## 🛣️ Step 7: Create src/routes.ts

```typescript
import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { Landing } from "./pages/Landing";
import { Results } from "./pages/Results";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Landing },
      { path: "search/:query", Component: Results },
    ],
  },
]);
```

## 🏠 Step 8: Create src/Root.tsx

```typescript
import { Outlet } from 'react-router';
import { Header } from './components/Header';

export function Root() {
  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <Header />
      <Outlet />
    </div>
  );
}
```

## 📁 Step 9: Create Folders

```bash
mkdir -p src/pages src/components
```

## 📃 Step 10: Create src/pages/Landing.tsx

```typescript
import { LandingHero } from '../components/LandingHero';

export function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <LandingHero />
    </div>
  );
}
```

## 📃 Step 11: Create src/pages/Results.tsx

```typescript
import { SearchSection } from '../components/SearchSection';
import { ConsensusCard } from '../components/ConsensusCard';
import { ExperienceCards } from '../components/ExperienceCards';
import { InsightsGrid } from '../components/InsightsGrid';
import { ExperienceDotPlot } from '../components/ExperienceDotPlot';

export function Results() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <main className="max-w-[1400px] mx-auto px-8 py-12">
        {/* Search Section */}
        <div className="mb-12">
          <SearchSection />
        </div>

        {/* Topic Header */}
        <div className="mb-8">
          <h1 className="text-[32px] font-semibold text-white tracking-[-0.02em] mb-2">
            Creatine
          </h1>
          <p className="text-[15px] text-[#a1a1a1]">
            Analyzed from 12,847 Reddit posts across 23 communities
          </p>
        </div>

        {/* Consensus Section */}
        <ConsensusCard />

        {/* Interactive Dot Plot */}
        <ExperienceDotPlot />

        {/* Experience Cards */}
        <ExperienceCards />

        {/* Insights Grid */}
        <InsightsGrid />
      </main>
    </div>
  );
}
```

## 🧩 Step 12: Create Components

Save each component below in `src/components/` folder:

### src/components/Header.tsx

```typescript
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
```

### src/components/SearchSection.tsx

```typescript
import { Search } from 'lucide-react';

export function SearchSection() {
  return (
    <div className="text-center max-w-[680px] mx-auto">
      <div className="relative">
        <input
          type="text"
          placeholder="Search anything (creatine, cold showers, SSRIs…)"
          className="w-full px-5 py-4 pr-28 rounded-xl border border-[#1f1f1f] bg-[#111111] focus:outline-none focus:ring-1 focus:ring-[#7c3aed] focus:border-[#7c3aed] transition-all text-[15px] text-white placeholder:text-[#6b7280]"
        />
        <button className="absolute right-1.5 top-1/2 -translate-y-1/2 px-5 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg transition-colors flex items-center gap-2 text-[14px] font-medium">
          <Search className="w-[15px] h-[15px]" />
          <span>Search</span>
        </button>
      </div>
      <button className="mt-4 text-[13px] text-[#a78bfa] hover:text-[#7c3aed] transition-colors font-medium">
        Filter by demographics →
      </button>
    </div>
  );
}
```

### src/components/InsightsGrid.tsx

```typescript
export function InsightsGrid() {
  const benefits = [
    { name: 'Increased strength', count: 68, percentage: 80 },
    { name: 'Better recovery', count: 52, percentage: 61 },
    { name: 'Muscle growth', count: 45, percentage: 53 },
    { name: 'Improved endurance', count: 38, percentage: 45 },
    { name: 'Mental clarity', count: 21, percentage: 25 },
  ];

  const sideEffects = [
    { name: 'Water retention', count: 32, percentage: 38 },
    { name: 'Stomach discomfort', count: 18, percentage: 21 },
    { name: 'Bloating', count: 15, percentage: 18 },
    { name: 'Cramping', count: 9, percentage: 11 },
    { name: 'Headaches', count: 5, percentage: 6 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
      {/* Benefits */}
      <div className="bg-[#111111] rounded-xl p-8 border border-[#1f1f1f]">
        <div className="mb-7 flex items-center gap-2">
          <h3 className="text-[13px] font-semibold text-[#6366f1] uppercase tracking-[0.05em]">Benefits Reported</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-[#6366f1]/20 to-transparent"></div>
        </div>
        <div className="space-y-6">
          {benefits.map((benefit, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[14px] text-[#d1d1d1] font-medium">{benefit.name}</span>
                <span className="text-[13px] text-[#a1a1a1] font-medium">{benefit.count}</span>
              </div>
              <div className="w-full bg-[#1f1f1f] rounded-full h-[6px] overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#6366f1] to-[#818cf8] h-full rounded-full transition-all duration-700"
                  style={{ width: `${benefit.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Side Effects */}
      <div className="bg-[#111111] rounded-xl p-8 border border-[#1f1f1f]">
        <div className="mb-7 flex items-center gap-2">
          <h3 className="text-[13px] font-semibold text-[#f97316] uppercase tracking-[0.05em]">Side Effects Reported</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-[#f97316]/20 to-transparent"></div>
        </div>
        <div className="space-y-6">
          {sideEffects.map((effect, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[14px] text-[#d1d1d1] font-medium">{effect.name}</span>
                <span className="text-[13px] text-[#a1a1a1] font-medium">{effect.count}</span>
              </div>
              <div className="w-full bg-[#1f1f1f] rounded-full h-[6px] overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#f97316] to-[#fb923c] h-full rounded-full transition-all duration-700"
                  style={{ width: `${effect.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

**CONTINUED IN NEXT FILE (Components are too long for one file)**

I'll create the remaining components in the next section...
