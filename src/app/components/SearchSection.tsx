import { Search } from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { queryParamToSlug } from '@/lib/slug';

export function SearchSection({
  initialInput = '',
  topicHint,
}: {
  initialInput?: string;
  topicHint?: string;
}) {
  const [q, setQ] = useState(initialInput);
  const navigate = useNavigate();

  useEffect(() => {
    setQ(initialInput);
  }, [initialInput]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const raw = q.trim() || topicHint || '';
    if (!raw) return;
    const slug = queryParamToSlug(raw);
    if (!slug) return;
    navigate(`/search/${slug}`);
  };

  return (
    <div className="text-center max-w-[680px] mx-auto">
      <form onSubmit={submit} className="relative">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search (e.g. creatine, cold showers…)"
          className="w-full px-5 py-4 pr-28 rounded-xl border border-[#1f1f1f] bg-[#111111] focus:outline-none focus:ring-1 focus:ring-[#7c3aed] focus:border-[#7c3aed] transition-all text-[15px] text-white placeholder:text-[#6b7280]"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-5 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg transition-colors flex items-center gap-2 text-[14px] font-medium"
        >
          <Search className="w-[15px] h-[15px]" />
          <span>Search</span>
        </button>
      </form>
      <p className="mt-3 text-[12px] text-[#6b7280]">Results load from the API (replay / live / corpus) — not mock counts.</p>
    </div>
  );
}
