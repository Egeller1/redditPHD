import { ArrowUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Positive', value: 72 },
  { name: 'Negative', value: 28 }
];

const COLORS = ['#6366f1', '#6b7280'];

export function ExperienceCards() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px_1fr] gap-6 mb-16">
      {/* Best Case */}
      <div className="bg-[#111111] rounded-xl p-7 border border-[#1f1f1f] hover:border-[#6366f1]/30 transition-all duration-300 group">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[13px] font-semibold text-[#6366f1] uppercase tracking-[0.05em]">Best Case</h3>
          <div className="flex items-center gap-1.5 text-[#6366f1] bg-[#6366f1]/10 px-2 py-1 rounded-md">
            <ArrowUp className="w-[13px] h-[13px]" />
            <span className="text-[12px] font-medium">2.4k</span>
          </div>
        </div>
        <blockquote className="text-[15px] text-[#d1d1d1] leading-[1.7] mb-6 border-l-2 border-[#6366f1]/30 pl-4">
          "Started taking 5g daily after workouts. Within 3 weeks I was lifting 10-15% more on compound movements. 
          Recovery between sets improved noticeably. Zero side effects. Wish I'd started sooner."
        </blockquote>
        <div className="flex items-center gap-3 pt-4 border-t border-[#1f1f1f]">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6366f1]/20 to-[#6366f1]/10 flex items-center justify-center text-[#6366f1] text-[12px] font-semibold">
            JM
          </div>
          <div className="text-[13px]">
            <p className="text-white font-medium">u/JohnMuscle</p>
            <p className="text-[#6b7280]">8 months ago</p>
          </div>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="bg-[#111111] rounded-xl p-8 border border-[#1f1f1f] flex flex-col items-center justify-center">
        <div className="relative w-52 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={68}
                outerRadius={88}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-[52px] font-[650] text-white tracking-[-0.02em] leading-none">72%</div>
            <div className="text-[13px] text-[#a1a1a1] mt-1 font-medium">Positive</div>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-8">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#6366f1]"></div>
            <span className="text-[13px] text-[#a1a1a1] font-medium">Positive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#6b7280]"></div>
            <span className="text-[13px] text-[#a1a1a1] font-medium">Negative</span>
          </div>
        </div>
      </div>

      {/* Worst Case */}
      <div className="bg-[#111111] rounded-xl p-7 border border-[#1f1f1f] hover:border-[#6b7280]/30 transition-all duration-300 group">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[13px] font-semibold text-[#6b7280] uppercase tracking-[0.05em]">Worst Case</h3>
          <div className="flex items-center gap-1.5 text-[#6b7280] bg-[#6b7280]/10 px-2 py-1 rounded-md">
            <ArrowUp className="w-[13px] h-[13px]" />
            <span className="text-[12px] font-medium">847</span>
          </div>
        </div>
        <blockquote className="text-[15px] text-[#d1d1d1] leading-[1.7] mb-6 border-l-2 border-[#6b7280]/30 pl-4">
          "Caused severe bloating and stomach cramps for me. Tried different brands and timing but the digestive 
          issues persisted. Also gained ~5lbs of water weight in the first week which was uncomfortable."
        </blockquote>
        <div className="flex items-center gap-3 pt-4 border-t border-[#1f1f1f]">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6b7280]/20 to-[#6b7280]/10 flex items-center justify-center text-[#6b7280] text-[12px] font-semibold">
            SJ
          </div>
          <div className="text-[13px]">
            <p className="text-white font-medium">u/SensitiveJoe</p>
            <p className="text-[#6b7280]">4 months ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}