import React from 'react';

export default function CalendarView({ tasks }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); 
  
  const days = Array.from({ length: 42 }, (_, i) => {
     const dayNum = i - firstDay + 1;
     return dayNum > 0 && dayNum <= daysInMonth ? dayNum : null;
  });

  const getTasksForDay = (day) => {
     if (!day) return [];
     return tasks.filter(t => t.deadline && new Date(t.deadline).getDate() === day && new Date(t.deadline).getMonth() === month);
  };

  return (
    <div className="bg-[#0F172A]/80 backdrop-blur-xl rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-[#1E293B] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 mb-8 z-10 relative">
       <div className="p-6 border-b border-[#1E293B] flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-900/40 text-[#38BDF8] rounded-xl flex items-center justify-center text-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-blue-500/30">📅</div>
             <div>
                <h2 className="text-xl font-black text-slate-100 tracking-tight drop-shadow-[0_0_10px_rgba(56,189,248,0.2)]">{new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Master Project Schedule</p>
             </div>
          </div>
          <div className="flex gap-2">
             <button className="px-4 py-2 bg-[#1E293B] text-[#38BDF8] font-black text-[11px] uppercase tracking-wider rounded-xl border border-blue-500/20 shadow-md hover:bg-blue-900/20 transition-all">Today</button>
          </div>
       </div>

       <div className="grid grid-cols-7 border-b border-[#1E293B] bg-slate-900/60">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, index) => (
             <div key={d} className={`p-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-[#1E293B]/50 last:border-r-0 ${index === 0 || index === 6 ? 'text-slate-600' : ''}`}>
               {d}
             </div>
          ))}
       </div>

       <div className="grid grid-cols-7 grid-rows-5 lg:grid-rows-6 bg-[#1E293B]/30 gap-px">
          {days.map((dayNum, idx) => {
             const dayTasks = getTasksForDay(dayNum);
             const isToday = dayNum === today.getDate();
             return (
               <div key={idx} className={`min-h-[140px] p-2 ${dayNum ? 'bg-[#0F172A] hover:bg-blue-900/10' : 'bg-slate-950/40'} transition-colors relative group`}>
                 {dayNum && (
                    <div className="flex flex-col h-full">
                       <div className="flex justify-between items-start mb-2">
                         <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-black ${isToday ? 'bg-[#38BDF8] text-[#0F172A] shadow-[0_0_15px_rgba(56,189,248,0.5)] ring-2 ring-blue-500/20' : 'text-slate-400 group-hover:text-[#38BDF8] transition-colors border border-transparent hover:border-blue-500/20'}`}>
                           {dayNum}
                         </span>
                         {dayTasks.length > 0 && <span className="text-[10px] font-bold text-slate-600 mt-1">{dayTasks.length} tasks</span>}
                       </div>
                       
                       <div className="space-y-1.5 flex-1 overflow-y-auto pr-1 flex flex-col custom-scrollbar">
                          {dayTasks.map(t => (
                             <div key={t.id} className={`text-[10px] font-bold px-2 py-1.5 rounded-lg truncate border shadow-sm transition-all hover:scale-[1.02] cursor-pointer ${t.status === 'done' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-500/20' : 'bg-slate-800/50 text-slate-300 border-slate-700/50 hover:border-[#38BDF8]/40 hover:text-white'}`} title={t.title}>
                                {t.title}
                             </div>
                          ))}
                       </div>
                    </div>
                 )}
               </div>
             );
          })}
       </div>
    </div>
  );
}
