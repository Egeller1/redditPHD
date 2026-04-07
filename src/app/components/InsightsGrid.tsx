import type { TopicBundle } from '@/types/topicBundle';

export function InsightsGrid({ bundle }: { bundle: TopicBundle }) {
  const { insights, metric_eligibility } = bundle;
  const benOk = metric_eligibility.benefits.shown;
  const seOk = metric_eligibility.side_effects.shown;
  const protocolsOk = metric_eligibility.protocols.shown;
  const stacksOk = metric_eligibility.stacks.shown;

  const benefits = benOk ? insights.benefits : [];
  const sideEffects = seOk ? insights.side_effects : [];
  const protocols = protocolsOk ? insights.protocols : [];
  const stacks = stacksOk ? insights.stacks : [];
  const maxBenPct = benefits.length ? Math.max(...benefits.map((b) => b.percent_of_units), 1) : 1;
  const maxSePct = sideEffects.length ? Math.max(...sideEffects.map((s) => s.percent_of_units), 1) : 1;
  const maxProtocolPct = protocols.length ? Math.max(...protocols.map((p) => p.percent_of_units), 1) : 1;
  const maxStackPct = stacks.length ? Math.max(...stacks.map((s) => s.percent_of_units), 1) : 1;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
      <div className="bg-[#0f1612] rounded-xl p-8 border border-[#1e2d1f]">
        <div className="mb-7 flex items-center gap-2">
          <h3 className="text-[13px] font-semibold text-[#6366f1] uppercase tracking-[0.05em]">Benefits Reported</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-[#6366f1]/20 to-transparent"></div>
        </div>
        {benOk ? (
          <div className="space-y-6">
            {benefits.map((benefit) => (
              <div key={benefit.name}>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[14px] text-[#d1d1d1] font-medium">{benefit.name}</span>
                  <span className="text-[13px] text-[#a1a1a1] font-medium">{benefit.count}</span>
                </div>
                <div className="w-full bg-[#1e2d1f] rounded-full h-[6px] overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#6366f1] to-[#818cf8] h-full rounded-full transition-all duration-700"
                    style={{ width: `${(benefit.percent_of_units / maxBenPct) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#6b7280] mt-1">
                  {benefit.percent_of_units.toFixed(0)}% of units · confidence {benefit.confidence}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[14px] text-[#6b7280]">{metric_eligibility.benefits.reason_hidden}</p>
        )}
      </div>

      <div className="bg-[#0f1612] rounded-xl p-8 border border-[#1e2d1f]">
        <div className="mb-7 flex items-center gap-2">
          <h3 className="text-[13px] font-semibold text-[#f97316] uppercase tracking-[0.05em]">Side Effects Reported</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-[#f97316]/20 to-transparent"></div>
        </div>
        {seOk ? (
          <div className="space-y-6">
            {sideEffects.map((effect) => (
              <div key={effect.name}>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[14px] text-[#d1d1d1] font-medium">{effect.name}</span>
                  <span className="text-[13px] text-[#a1a1a1] font-medium">{effect.count}</span>
                </div>
                <div className="w-full bg-[#1e2d1f] rounded-full h-[6px] overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#f97316] to-[#fb923c] h-full rounded-full transition-all duration-700"
                    style={{ width: `${(effect.percent_of_units / maxSePct) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#6b7280] mt-1">
                  {effect.percent_of_units.toFixed(0)}% of units · confidence {effect.confidence}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[14px] text-[#6b7280]">{metric_eligibility.side_effects.reason_hidden}</p>
        )}
      </div>

      <div className="bg-[#0f1612] rounded-xl p-8 border border-[#1e2d1f]">
        <div className="mb-7 flex items-center gap-2">
          <h3 className="text-[13px] font-semibold text-[#5eead4] uppercase tracking-[0.05em]">Protocols Mentioned</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-[#5eead4]/20 to-transparent"></div>
        </div>
        {protocolsOk ? (
          <div className="space-y-6">
            {protocols.map((protocol) => (
              <div key={protocol.name}>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[14px] text-[#d1d1d1] font-medium">{protocol.name}</span>
                  <span className="text-[13px] text-[#a1a1a1] font-medium">{protocol.count}</span>
                </div>
                <div className="w-full bg-[#1e2d1f] rounded-full h-[6px] overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#5eead4] to-[#c4b5fd] h-full rounded-full transition-all duration-700"
                    style={{ width: `${(protocol.percent_of_units / maxProtocolPct) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#6b7280] mt-1">{protocol.percent_of_units.toFixed(0)}% of units</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[14px] text-[#6b7280]">{metric_eligibility.protocols.reason_hidden}</p>
        )}
      </div>

      <div className="bg-[#0f1612] rounded-xl p-8 border border-[#1e2d1f]">
        <div className="mb-7 flex items-center gap-2">
          <h3 className="text-[13px] font-semibold text-[#22c55e] uppercase tracking-[0.05em]">Stacks Mentioned</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-[#22c55e]/20 to-transparent"></div>
        </div>
        {stacksOk ? (
          <div className="space-y-6">
            {stacks.map((stack) => (
              <div key={stack.name}>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[14px] text-[#d1d1d1] font-medium">{stack.name}</span>
                  <span className="text-[13px] text-[#a1a1a1] font-medium">{stack.count}</span>
                </div>
                <div className="w-full bg-[#1e2d1f] rounded-full h-[6px] overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#22c55e] to-[#4ade80] h-full rounded-full transition-all duration-700"
                    style={{ width: `${(stack.percent_of_units / maxStackPct) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#6b7280] mt-1">{stack.percent_of_units.toFixed(0)}% of units</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[14px] text-[#6b7280]">{metric_eligibility.stacks.reason_hidden}</p>
        )}
      </div>
    </div>
  );
}
