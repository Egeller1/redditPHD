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