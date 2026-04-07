import { useState } from 'react';
import { personalizeTopicBundle } from '@/lib/topicApi';
import type { PersonalizeResponse, PersonalizedRecommendation, SexValue, TopicBundle } from '@/types/topicBundle';

export function ConsensusCard({ bundle }: { bundle: TopicBundle }) {
  const { consensus, metric_eligibility } = bundle;
  const el = metric_eligibility.consensus;
  const shownConsensus = consensus;

  return (
    <div className="bg-gradient-to-br from-[#0f1612] to-[#0c1410] rounded-2xl px-10 pt-10 pb-8 border border-[#14b8a6]/20 shadow-[0_1px_2px_rgba(0,0,0,0.4)] mb-6 relative overflow-hidden">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-[12px] font-semibold text-[#5eead4] uppercase tracking-[0.08em]">Expected Experience</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-[#14b8a6]/20 to-transparent" />
      </div>

      {el.shown ? (
        <>
          <p className="text-[22px] font-semibold text-white leading-[1.5] mb-5 tracking-[-0.01em]">
            {shownConsensus.summary_text}
          </p>
          <p className="text-[12px] text-[#525252]">
            Based on {shownConsensus.sample_size} posts &middot; avg {shownConsensus.expected_score}/10 &middot; {shownConsensus.confidence}% confidence &middot; community discussion, not medical advice
          </p>
        </>
      ) : (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[14px] text-amber-100/90">
          <p className="font-medium text-amber-200/95 mb-1">Consensus hidden</p>
          <p className="text-[13px] text-[#a1a1a1]">{el.reason_hidden ?? 'Not enough data for a reliable summary.'}</p>
        </div>
      )}
    </div>
  );
}

export function PersonalizeSection({ bundle, onPersonalized }: {
  bundle: TopicBundle;
  onPersonalized: (r: PersonalizeResponse) => void;
}) {
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<SexValue | ''>('');
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [recommendation, setRecommendation] = useState<PersonalizedRecommendation | null>(null);

  async function onSubmit() {
    setLoading(true);
    setError(null);
    setNote(null);
    try {
      const out = await personalizeTopicBundle(bundle.topic.slug, {
        age: age.trim() ? Number(age) : null,
        sex: sex || null,
      });
      onPersonalized(out);
      setNote(out.personalization_note ?? null);
      setRecommendation(out.recommendation ?? null);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to personalize');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-14">
      {/* Arrow + heading */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-px h-8 bg-gradient-to-b from-[#14b8a6]/40 to-transparent mb-2" />
        <div className="flex items-center gap-2 text-[#5eead4]">
          <span className="text-[13px] font-semibold tracking-wide uppercase">Personalize your experience</span>
        </div>
        <p className="text-[12px] text-[#525252] mt-1">Add your age &amp; sex for a more tailored summary</p>
        <svg className="mt-2 text-[#14b8a6]/50" width="16" height="20" viewBox="0 0 16 20" fill="none">
          <path d="M8 0 L8 16 M2 10 L8 18 L14 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Always-visible form */}
      <div className="rounded-xl border border-[#14b8a6]/25 bg-[#0c1410] px-8 py-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-[12px] text-[#6b7280] mb-2">Age</label>
            <input
              type="number"
              placeholder="Optional"
              className="w-full bg-[#111111] border border-[#1f1f1f] rounded-lg px-4 py-2.5 text-[14px] text-white placeholder-[#404040] focus:border-[#14b8a6] focus:outline-none transition-colors"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min={0}
            />
          </div>
          <div className="flex-1">
            <label className="block text-[12px] text-[#6b7280] mb-2">Sex</label>
            <select
              className="w-full bg-[#111111] border border-[#1f1f1f] rounded-lg px-4 py-2.5 text-[14px] text-white focus:border-[#14b8a6] focus:outline-none transition-colors appearance-none"
              value={sex}
              onChange={(e) => setSex(e.target.value as SexValue | '')}
            >
              <option value="">Optional</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={onSubmit}
              disabled={loading}
              className="px-6 py-2.5 bg-[#14b8a6] hover:bg-[#0d9488] disabled:bg-[#3f3f46] disabled:text-[#a1a1aa] text-white text-[14px] font-medium rounded-lg transition-colors"
            >
              {loading ? 'Updating…' : 'Update'}
            </button>
          </div>
        </div>

        {done && !error && (
          <p className="text-[12px] text-[#5eead4]">✓ Results updated for you</p>
        )}
        {note && <p className="text-[12px] text-[#525252] mt-1">{note}</p>}
        {error && <p className="text-[12px] text-red-300 mt-1">{error}</p>}
      </div>

      {recommendation && (
        <div className="mt-5 bg-gradient-to-br from-[#0f1612] to-[#0c1410] rounded-2xl px-10 pt-8 pb-7 border border-[#14b8a6]/20 shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-[12px] font-semibold text-[#5eead4] uppercase tracking-[0.08em]">Your Personalized Recommendation</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-[#14b8a6]/20 to-transparent" />
          </div>
          <p className="text-[22px] font-semibold text-white leading-[1.5] mb-3 tracking-[-0.01em]">
            {recommendation.headline}
          </p>
          <p className="text-[15px] text-[#a1a1a1] leading-[1.6]">
            {recommendation.blurb}
          </p>
        </div>
      )}
    </div>
  );
}
