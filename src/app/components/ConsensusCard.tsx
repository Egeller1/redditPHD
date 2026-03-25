import { Lightbulb } from 'lucide-react';

export function ConsensusCard() {
  return (
    <div className="bg-gradient-to-br from-[#111111] to-[#0f0f0f] rounded-2xl p-10 border border-[#7c3aed]/20 shadow-[0_1px_2px_rgba(0,0,0,0.4)] mb-16 relative overflow-hidden">
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-[13px] font-semibold text-[#a78bfa] uppercase tracking-[0.05em]">Expected Experience</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-[#7c3aed]/20 to-transparent"></div>
      </div>
      
      <p className="text-[17px] text-[#e5e5e5] leading-[1.7] mb-8 font-[450]">
        The consensus suggests creatine monohydrate is most effective when taken daily (3-5g) with consistent hydration. 
        Most users report noticeable improvements in strength and endurance within 2-4 weeks.
      </p>
      
      {/* Predicted Outcome */}
      <div className="flex items-center gap-2 bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 rounded-lg px-4 py-3 mb-6">
        <div className="w-[10px] h-[10px] rounded-full bg-[#8b5cf6] border-2 border-[#8b5cf6]" />
        <span className="text-[13px] text-white font-medium">Your predicted outcome: 7.5/10</span>
        <span className="text-[12px] text-[#a1a1a1]">(85% confidence)</span>
      </div>
      
      {/* Personalization Form */}
      <div className="bg-[#0a0a0a] rounded-xl p-6 border border-[#1f1f1f]">
        <p className="text-[13px] text-[#a1a1a1] mb-4">Personalize for better results</p>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-[12px] text-[#6b7280] mb-2">Age</label>
            <input
              type="number"
              placeholder="e.g., 28"
              className="w-full bg-[#111111] border border-[#1f1f1f] rounded-lg px-4 py-2.5 text-[14px] text-white placeholder-[#404040] focus:border-[#7c3aed] focus:outline-none transition-colors"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[12px] text-[#6b7280] mb-2">Sex</label>
            <select className="w-full bg-[#111111] border border-[#1f1f1f] rounded-lg px-4 py-2.5 text-[14px] text-white focus:border-[#7c3aed] focus:outline-none transition-colors appearance-none cursor-pointer">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="px-6 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-[14px] font-medium rounded-lg transition-colors">
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}