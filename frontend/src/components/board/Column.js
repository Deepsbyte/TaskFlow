import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';

export default function Column({ columnId, title, tasks, count, onTaskClick }) {
  const { isOver, setNodeRef } = useDroppable({ id: columnId });

  return (
    <div ref={setNodeRef} className={`w-[320px] shrink-0 flex flex-col bg-[#0F172A] rounded-xl border border-[#1E293B] shadow-lg overflow-hidden transition-colors duration-300 ${isOver ? 'bg-[#1E293B]/80 border-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.2)]' : ''}`}>
      <div className="px-4 py-3 flex justify-between items-center bg-[#0B1121] border-b border-[#1E293B]">
        <h3 className="font-black text-xs text-slate-300 uppercase tracking-widest">{title}</h3>
        <span className="text-[10px] font-bold bg-[#1E293B] text-slate-400 px-2 py-0.5 rounded-full border border-slate-700/50 shadow-inner">{count}</span>
      </div>
      
      <div className="flex-1 px-3 py-4 overflow-y-auto min-h-[600px] custom-scrollbar">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} column={columnId} onClick={() => onTaskClick(task)} />
        ))}
        {tasks.length === 0 && (
          <div className="h-[200px] w-full border border-dashed border-[#1E293B] rounded-xl flex items-center justify-center opacity-50 bg-[#0B1121]/50"></div>
        )}
      </div>
    </div>
  );
}
