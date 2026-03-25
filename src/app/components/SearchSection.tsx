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