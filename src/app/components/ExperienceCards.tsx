import { ExternalLink } from 'lucide-react';
import type { TopicBundle } from '@/types/topicBundle';

function formatAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return iso;
  const d = Math.max(0, Date.now() - t);
  const day = 86400000;
  if (d < day) return 'Today';
  if (d < 14 * day) return `${Math.round(d / day)} days ago`;
  if (d < 60 * day) return `${Math.round(d / (7 * day))} wks ago`;
  return `${Math.round(d / (30 * day))} mo ago`;
}

function initials(name: string | null): string {
  if (!name) return '?';
  const u = name.replace(/^u\//i, '');
  return u.slice(0, 2).toUpperCase();
}

export function ExperienceCards({ bundle }: { bundle: TopicBundle }) {
  const { representative_posts, insights } = bundle;
  const pos = representative_posts.positive;
  const neg = representative_posts.negative;

  const worstTags = (insights?.side_effects ?? []).slice(0, 3).map((i) => i.name);
  const bestTags = (insights?.benefits ?? []).slice(0, 3).map((i) => i.name);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
      {/* ── WORST CASE ── */}
      <div
        className="rounded-xl p-8 border flex flex-col transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, #1a0a0a 0%, #0f1612 100%)',
          borderColor: 'rgba(239,68,68,0.35)',
          boxShadow: '0 0 28px rgba(239,68,68,0.10), inset 0 1px 0 rgba(239,68,68,0.08)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-bold text-red-400 uppercase tracking-[0.06em]">Worst Case</h3>
          {neg && (
            <div className="flex items-center gap-1.5 bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/20">
              <span className="text-[13px] font-semibold text-red-400">{neg.score.toFixed(1)}/10</span>
            </div>
          )}
        </div>

        {worstTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {worstTags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-md text-[12px] font-medium"
                style={{
                  background: 'rgba(239,68,68,0.10)',
                  color: '#fca5a5',
                  border: '1px solid rgba(239,68,68,0.22)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {neg ? (
          <>
            <blockquote
              className="text-[16px] text-[#d1d1d1] leading-[1.75] mb-6 pl-4 flex-1"
              style={{ borderLeft: '2px solid rgba(239,68,68,0.35)' }}
            >
              "{neg.excerpt}"
            </blockquote>
            <div className="flex items-center gap-3 pt-4 border-t border-red-900/30">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-semibold"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5' }}
              >
                {initials(neg.username)}
              </div>
              <div className="text-[13px] flex-1 min-w-0">
                <p className="text-white font-medium truncate">{neg.username ? `u/${neg.username}` : 'Unknown'}</p>
                <p className="text-[#6b7280]">{formatAgo(neg.timestamp_utc)} · r/{neg.subreddit}</p>
              </div>
              <a href={neg.url} target="_blank" rel="noopener noreferrer" className="text-[#5eead4] hover:text-white shrink-0" aria-label="Open on Reddit">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </>
        ) : (
          <p className="text-[14px] text-[#6b7280] flex-1">No clearly negative representative post found in this sample.</p>
        )}
      </div>

      {/* ── BEST CASE ── */}
      <div
        className="rounded-xl p-8 border flex flex-col transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, #0a0d1a 0%, #0f1612 100%)',
          borderColor: 'rgba(99,102,241,0.35)',
          boxShadow: '0 0 28px rgba(99,102,241,0.10), inset 0 1px 0 rgba(99,102,241,0.08)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-bold text-indigo-400 uppercase tracking-[0.06em]">Best Case</h3>
          {pos && (
            <div className="flex items-center gap-1.5 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
              <span className="text-[13px] font-semibold text-indigo-400">{pos.score.toFixed(1)}/10</span>
            </div>
          )}
        </div>

        {bestTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {bestTags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-md text-[12px] font-medium"
                style={{
                  background: 'rgba(99,102,241,0.12)',
                  color: '#a5b4fc',
                  border: '1px solid rgba(99,102,241,0.24)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {pos ? (
          <>
            <blockquote
              className="text-[16px] text-[#d1d1d1] leading-[1.75] mb-6 pl-4 flex-1"
              style={{ borderLeft: '2px solid rgba(99,102,241,0.4)' }}
            >
              "{pos.excerpt}"
            </blockquote>
            <div className="flex items-center gap-3 pt-4 border-t border-indigo-900/30">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-semibold"
                style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}
              >
                {initials(pos.username)}
              </div>
              <div className="text-[13px] flex-1 min-w-0">
                <p className="text-white font-medium truncate">{pos.username ? `u/${pos.username}` : 'Unknown'}</p>
                <p className="text-[#6b7280]">{formatAgo(pos.timestamp_utc)} · r/{pos.subreddit}</p>
              </div>
              <a href={pos.url} target="_blank" rel="noopener noreferrer" className="text-[#5eead4] hover:text-white shrink-0" aria-label="Open on Reddit">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </>
        ) : (
          <p className="text-[14px] text-[#6b7280] flex-1">No clearly positive representative post found in this sample.</p>
        )}
      </div>
    </div>
  );
}
