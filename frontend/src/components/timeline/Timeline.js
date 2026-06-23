import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const STATUS_COLORS = {
  'To Do': 'bg-slate-700/50 border-slate-600',
  'In Progress': 'bg-indigo-500/20 border-indigo-500/50',
  'Code Review': 'bg-amber-500/20 border-amber-500/50',
  'Done': 'bg-green-500/20 border-green-500/50',
};

const Timeline = ({ tasks }) => {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  // Generate 28 days for the view
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 28 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i + (currentWeekOffset * 28));
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('default', { month: 'short' }),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      fullDate: date.toISOString().split('T')[0],
      timestamp: date.getTime()
    };
  });

  const timelineStart = days[0].timestamp;

  return (
    <div className="flex flex-col h-full bg-background-base">
      {/* Timeline Controls */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-background-sidebar border border-slate-700 rounded-lg p-1">
            <button 
              onClick={() => setCurrentWeekOffset(prev => prev - 1)}
              className="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 text-xs font-bold text-slate-300 uppercase tracking-widest">
              {days[0].month} {new Date(days[0].timestamp).getFullYear()}
            </span>
            <button 
              onClick={() => setCurrentWeekOffset(prev => prev + 1)}
              className="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-background-sidebar border border-slate-700 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-colors">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
        </div>
        
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-slate-700 rounded" /> To Do</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-indigo-500/50 rounded" /> In Progress</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-amber-500/50 rounded" /> Code Review</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-green-500/50 rounded" /> Done</div>
        </div>
      </div>

      {/* Gantt Area */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="inline-block min-w-full">
          {/* Header Grid */}
          <div 
            className="sticky top-0 z-10 bg-background-base/90 backdrop-blur-md border-b border-slate-700/50"
            style={{ display: 'grid', gridTemplateColumns: '250px repeat(28, minmax(40px, 1fr))' }}
          >
            <div className="p-4 border-r border-slate-700 font-bold text-[10px] text-slate-500 uppercase tracking-widest">Mission Tasks</div>
            {days.map((day, i) => {
              const isToday = day.fullDate === new Date().toISOString().split('T')[0];
              return (
                <div 
                  key={i} 
                  className={`flex flex-col items-center justify-center border-r border-slate-800/50 py-3 ${day.isWeekend ? 'bg-slate-900/40' : ''}`}
                >
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{day.month}</span>
                  <span className={`text-sm font-bold mt-1 ${isToday ? 'text-indigo-400 bg-indigo-500/10 px-1.5 rounded' : 'text-slate-300'}`}>{day.day}</span>
                </div>
              );
            })}
          </div>

          {/* Task Rows */}
          {tasks.map((task) => {
            let taskDate;
            if (task.dueDate) {
              const [y, m, d] = task.dueDate.split('-').map(Number);
              taskDate = new Date(y, m - 1, d).getTime();
            } else {
              taskDate = today.getTime();
            }
            
            const duration = Math.max(2, task.points || 5);
            const msPerDay = 1000 * 60 * 60 * 24;
            let startIdx = Math.round((taskDate - timelineStart) / msPerDay);
            
            const isVisible = (startIdx + duration >= 0) && (startIdx < 28);
            if (!isVisible) return null;

            const safeStartIdx = Math.max(0, startIdx);
            const safeDuration = Math.min(duration, 28 - safeStartIdx);

            return (
              <div 
                key={task.id} 
                className="items-center border-b border-slate-800 hover:bg-slate-800/20 transition-colors group"
                style={{ display: 'grid', gridTemplateColumns: '250px 1fr' }}
              >
                <div className="p-4 border-r border-slate-800 flex flex-col gap-1 overflow-hidden h-full justify-center">
                  <span className="text-xs font-bold text-white truncate group-hover:text-indigo-400 transition-colors">{task.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-slate-500">{task.id}</span>
                    {task.dueDate && <span className="text-[9px] font-bold text-slate-600 uppercase">{new Date(taskDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>}
                  </div>
                </div>
                
                <div className="relative h-16">
                   {/* Background Grid Lines */}
                   <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(28, 1fr)' }}
                   >
                    {days.map((day, i) => {
                      const isToday = day.fullDate === new Date().toISOString().split('T')[0];
                      return (
                        <div key={i} className={`border-r border-slate-800/30 h-full relative ${day.isWeekend ? 'bg-slate-900/20' : ''}`}>
                          {isToday && <div className="absolute inset-y-0 left-0 w-px bg-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.5)] z-10" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Task Bar */}
                  <div 
                    className={`absolute top-1/2 -translate-y-1/2 h-8 rounded-lg border flex items-center px-3 z-20 shadow-xl cursor-default transition-all hover:scale-[1.02] ${STATUS_COLORS[task.status] || STATUS_COLORS['To Do']}`}
                    style={{ 
                      left: `${(safeStartIdx / 28) * 100}%`, 
                      width: `${(safeDuration / 28) * 100}%` 
                    }}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                       <span className="text-[9px] font-black text-white uppercase tracking-tighter shrink-0">{task.id}</span>
                       <span className="text-[10px] font-bold text-white/90 truncate">{task.assignee}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
