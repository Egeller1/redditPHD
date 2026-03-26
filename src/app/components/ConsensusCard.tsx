import { useState } from 'react';
import { personalizeTopicBundle } from '@/lib/topicApi';
import type { PersonalizeResponse, SexValue, TopicBundle } from '@/types/topicBundle';

export function ConsensusCard({ bundle }: { bundle: TopicBundle }) {
  const { consensus, metric_eligibility, experience_score_definition } = bundle;
  const el = metric_eligibility.consensus;
  const [age, setAge] = useState<string>('');
  const [sex, setSex] = useState<SexValue | ''>('');
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [personalized, setPersonalized] = useState<PersonalizeResponse | null>(null);
  const shownConsensus = personalized?.consensus ?? consensus;

  async function onPersonalize() {
    setLoading(true);
    setError(null);
    setNote(null);
    try {
      const out = await personalizeTopicBundle(bundle.topic.slug, {
        age: age.trim() ? Number(age) : null,
        sex: sex || null,
      });
      setPersonalized(out);
      setNote(out.personalization_note ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to personalize');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gradient-to-br from-[#111111] to-[#0f0f0f] rounded-2xl p-10 border border-[#7c3aed]/20 shadow-[0_1px_2px_rgba(0,0,0,0.4)] mb-16 relative overflow-hidden">
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-[13px] font-semibold text-[#a78bfa] uppercase tracking-[0.05em]">Expected Experience</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-[#7c3aed]/20 to-transparent"></div>
      </div>

      {el.shown ? (
        <p className="text-[17px] text-[#e5e5e5] leading-[1.7] mb-6 font-[450]">{shownConsensus.summary_text}</p>
      ) : (
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[14px] text-amber-100/90">
          <p className="font-medium text-amber-200/95 mb-1">Consensus hidden</p>
          <p className="text-[13px] text-[#a1a1a1]">{el.reason_hidden ?? 'Not enough data for a reliable summary.'}</p>
        </div>
      )}

      {el.shown && (
        <div className="flex items-center gap-2 bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 rounded-lg px-4 py-3 mb-6">
          <div className="w-[10px] h-[10px] rounded-full bg-[#8b5cf6] border-2 border-[#8b5cf6]" />
          <span className="text-[13px] text-white font-medium">
            Sample mean score: {shownConsensus.expected_score}/10
          </span>
          <span className="text-[12px] text-[#a1a1a1]">
            ({shownConsensus.confidence}% confidence · n={shownConsensus.sample_size})
          </span>
        </div>
      )}

      <p className="text-[12px] text-[#6b7280] mb-6 leading-relaxed border-t border-[#1f1f1f] pt-4">
        {experience_score_definition}
      </p>

      <div className="bg-[#0a0a0a] rounded-xl p-6 border border-[#1f1f1f]">
        <p className="text-[13px] text-[#a1a1a1] mb-4">Personalize (calls backend endpoint)</p>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-[12px] text-[#6b7280] mb-2">Age</label>
            <input
              type="number"
              placeholder="Optional"
              className="w-full bg-[#111111] border border-[#1f1f1f] rounded-lg px-4 py-2.5 text-[14px] text-white placeholder-[#404040] focus:border-[#7c3aed] focus:outline-none transition-colors"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min={0}
            />
          </div>
          <div className="flex-1">
            <label className="block text-[12px] text-[#6b7280] mb-2">Sex</label>
            <select
              className="w-full bg-[#111111] border border-[#1f1f1f] rounded-lg px-4 py-2.5 text-[14px] text-white focus:border-[#7c3aed] focus:outline-none transition-colors appearance-none"
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
              onClick={onPersonalize}
              disabled={loading}
              className="px-6 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:bg-[#3f3f46] disabled:text-[#a1a1aa] text-white text-[14px] font-medium rounded-lg transition-colors"
            >
              {loading ? 'Updating…' : 'Update'}
            </button>
          </div>
        </div>
        {note && <p className="mt-3 text-[12px] text-[#a1a1a1]">{note}</p>}
        {error && <p className="mt-3 text-[12px] text-red-300">{error}</p>}
      </div>
    </div>
  );
}
