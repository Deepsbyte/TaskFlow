import React from 'react';

export default function Sidebar({ onLogout }) {
  return (
    <div className="w-64 bg-[#0F172A] border-r border-[#1E293B] flex flex-col h-screen py-6 px-4 z-40 relative">
      <div className="flex items-center gap-3 mb-10 px-2 group cursor-pointer">
         <div className="w-8 h-8 bg-gradient-to-tr from-slate-700 to-slate-800 rounded-lg flex items-center justify-center font-bold text-white shadow-inner border border-slate-600 group-hover:border-[#38BDF8] transition-colors">🚀</div>
         <div>
            <h2 className="font-extrabold text-[15px] text-slate-200 tracking-tight leading-tight group-hover:text-[#38BDF8] transition-colors">Teams in Space</h2>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Software Project</p>
         </div>
      </div>

      <div className="flex flex-col gap-1.5 mb-8">
         <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2 mb-2">Planning</h3>
         <div className="px-3 py-2 rounded-lg bg-blue-900/20 text-[#38BDF8] font-bold text-sm cursor-pointer border border-blue-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            Kanban Board
         </div>
         <div className="px-3 py-2 rounded-lg text-slate-400 hover:bg-[#1E293B] hover:text-slate-200 font-semibold text-sm cursor-pointer transition-colors">
            Timeline
         </div>
         <div className="px-3 py-2 rounded-lg text-slate-400 hover:bg-[#1E293B] hover:text-slate-200 font-semibold text-sm cursor-pointer transition-colors">
            Backlog
         </div>
      </div>

      <div className="flex flex-col gap-1.5">
         <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2 mb-2">Development</h3>
         <div className="px-3 py-2 rounded-lg text-slate-400 hover:bg-[#1E293B] hover:text-slate-200 font-semibold text-sm cursor-pointer transition-colors flex justify-between items-center group">
            <span>Code</span>
            <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded group-hover:text-slate-300">Git</span>
         </div>
         <div className="px-3 py-2 rounded-lg text-slate-400 hover:bg-[#1E293B] hover:text-slate-200 font-semibold text-sm cursor-pointer transition-colors">
            Releases
         </div>
      </div>
      
      <div className="mt-auto border-t border-[#1E293B] pt-4 flex flex-col gap-2">
         <div className="px-3 py-2 rounded-lg text-slate-500 hover:bg-[#1E293B] hover:text-slate-300 font-bold text-sm cursor-pointer transition-colors flex items-center gap-2">
            <span>⚙️</span> Project settings
         </div>
         <div 
           onClick={onLogout}
           className="px-3 py-2 rounded-lg text-rose-500 hover:bg-rose-950/20 hover:text-rose-400 font-black text-[11px] uppercase tracking-widest cursor-pointer transition-all flex items-center gap-2 border border-transparent hover:border-rose-500/20 shadow-sm"
         >
            <span>🚪</span> Terminate Session
         </div>
      </div>
    </div>
  );
}
