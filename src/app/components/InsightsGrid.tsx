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