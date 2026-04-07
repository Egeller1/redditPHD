import { Search } from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { queryParamToSlug } from '@/lib/slug';

export function SearchSection({
  initialInput = '',
  topicHint,
}: {
  initialInput?: string;
  topicHint?: string;
}) {
  const [q, setQ] = useState(initialInput);
  const [squishing, setSquishing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setQ(initialInput);
  }, [initialInput]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const raw = q.trim() || topicHint || '';
    if (!raw || squishing) return;
    const slug = queryParamToSlug(raw);
    if (!slug) return;

    setSquishing(true);
    // Give the squish animation ~350ms then navigate
    setTimeout(() => {
      navigate(`/search/${slug}`);
    }, 350);
  };

  return (
    <div className="text-center max-w-[680px] mx-auto">
      <motion.form
        onSubmit={submit}
        className="relative"
        animate={squishing ? {
          scaleX: [1, 0.6, 0.18],
          scaleY: [1, 1.1, 1.1],
          borderRadius: ['12px', '40px', '999px'],
          opacity: [1, 1, 0],
        } : {}}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        style={{ originX: '50%', originY: '50%' }}
      >
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          disabled={squishing}
          placeholder="Search (e.g. creatine, cold showers…)"
          className="w-full px-5 py-4 pr-28 rounded-xl border border-[#1f1f1f] bg-[#111111] focus:outline-none focus:ring-1 focus:ring-[#14b8a6] focus:border-[#14b8a6] transition-all text-[15px] text-white placeholder:text-[#6b7280] disabled:opacity-80"
        />
        <button
          type="submit"
          disabled={squishing}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-5 py-2 bg-[#14b8a6] hover:bg-[#0d9488] disabled:bg-[#0d9488] text-white rounded-lg transition-colors flex items-center gap-2 text-[14px] font-medium"
        >
          <Search className="w-[15px] h-[15px]" />
          <span>Search</span>
        </button>
      </motion.form>
      <p className="mt-3 text-[12px] text-[#6b7280]">Results load from the API (replay / live / corpus) — not mock counts.</p>
    </div>
  );
}
