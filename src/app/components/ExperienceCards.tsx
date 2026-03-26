import { ArrowUp, ExternalLink } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
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
  const { representative_posts, sentiment, metric_eligibility } = bundle;
  const pos = representative_posts.positive;
  const neg = representative_posts.negative;
  const sentOk = metric_eligibility.sentiment.shown;

  const pieData = sentOk
    ? [
        { name: 'Positive', value: Math.round(sentiment.positive_percent) },
        { name: 'Neutral', value: Math.round(sentiment.neutral_percent) },
        { name: 'Negative', value: Math.round(sentiment.negative_percent) },
      ]
    : [];

  const COLORS = ['#6366f1', '#f97316', '#6b7280'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px_1fr] gap-6 mb-16">
      <div className="bg-[#111111] rounded-xl p-7 border border-[#1f1f1f] hover:border-[#6366f1]/30 transition-all duration-300">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[13px] font-semibold text-[#6366f1] uppercase tracking-[0.05em]">Representative positive</h3>
          {pos && (
            <div className="flex items-center gap-1.5 text-[#6366f1] bg-[#6366f1]/10 px-2 py-1 rounded-md">
              <ArrowUp className="w-[13px] h-[13px]" />
              <span className="text-[12px] font-medium">{pos.score.toFixed(1)}/10</span>
            </div>
          )}
        </div>
        {pos ? (
          <>
            <blockquote className="text-[15px] text-[#d1d1d1] leading-[1.7] mb-6 border-l-2 border-[#6366f1]/30 pl-4">
              “{pos.excerpt}”
            </blockquote>
            <div className="flex items-center gap-3 pt-4 border-t border-[#1f1f1f]">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6366f1]/20 to-[#6366f1]/10 flex items-center justify-center text-[#6366f1] text-[12px] font-semibold">
                {initials(pos.username)}
              </div>
              <div className="text-[13px] flex-1 min-w-0">
                <p className="text-white font-medium truncate">{pos.username ? `u/${pos.username}` : 'Unknown'}</p>
                <p className="text-[#6b7280]">{formatAgo(pos.timestamp_utc)} · r/{pos.subreddit}</p>
              </div>
              <a
                href={pos.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#a78bfa] hover:text-white shrink-0"
                aria-label="Open on Reddit"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </>
        ) : (
          <p className="text-[14px] text-[#6b7280]">
            No post in this sample met representative filters for a clearly positive stance. Showing nothing is more honest than a filler quote.
          </p>
        )}
      </div>

      <div className="bg-[#111111] rounded-xl p-8 border border-[#1f1f1f] flex flex-col items-center justify-center">
        {sentOk ? (
          <>
            <div className="relative w-52 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-[36px] font-[650] text-white tracking-[-0.02em] leading-none">n={sentiment.sample_size}</div>
                <div className="text-[13px] text-[#a1a1a1] mt-1 font-medium">Sentiment mix</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8 text-[13px] text-[#a1a1a1]">
              <span>
                <span className="text-[#6366f1] font-medium">{sentiment.positive_percent.toFixed(0)}%</span> pos
              </span>
              <span>
                <span className="text-[#f97316] font-medium">{sentiment.neutral_percent.toFixed(0)}%</span> neu
              </span>
              <span>
                <span className="text-[#6b7280] font-medium">{sentiment.negative_percent.toFixed(0)}%</span> neg
              </span>
            </div>
          </>
        ) : (
          <div className="text-center px-4">
            <p className="text-[14px] text-[#a1a1a1] font-medium mb-2">Sentiment chart hidden</p>
            <p className="text-[13px] text-[#6b7280]">{metric_eligibility.sentiment.reason_hidden}</p>
          </div>
        )}
      </div>

      <div className="bg-[#111111] rounded-xl p-7 border border-[#1f1f1f] hover:border-[#6b7280]/30 transition-all duration-300">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[13px] font-semibold text-[#6b7280] uppercase tracking-[0.05em]">Representative negative</h3>
          {neg && (
            <div className="flex items-center gap-1.5 text-[#6b7280] bg-[#6b7280]/10 px-2 py-1 rounded-md">
              <span className="text-[12px] font-medium">{neg.score.toFixed(1)}/10</span>
            </div>
          )}
        </div>
        {neg ? (
          <>
            <blockquote className="text-[15px] text-[#d1d1d1] leading-[1.7] mb-6 border-l-2 border-[#6b7280]/30 pl-4">
              “{neg.excerpt}”
            </blockquote>
            <div className="flex items-center gap-3 pt-4 border-t border-[#1f1f1f]">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6b7280]/20 to-[#6b7280]/10 flex items-center justify-center text-[#6b7280] text-[12px] font-semibold">
                {initials(neg.username)}
              </div>
              <div className="text-[13px] flex-1 min-w-0">
                <p className="text-white font-medium truncate">{neg.username ? `u/${neg.username}` : 'Unknown'}</p>
                <p className="text-[#6b7280]">{formatAgo(neg.timestamp_utc)} · r/{neg.subreddit}</p>
              </div>
              <a
                href={neg.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#a78bfa] hover:text-white shrink-0"
                aria-label="Open on Reddit"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </>
        ) : (
          <p className="text-[14px] text-[#6b7280]">
            No post in this sample met representative filters for a clearly negative stance.
          </p>
        )}
      </div>
    </div>
  );
}
