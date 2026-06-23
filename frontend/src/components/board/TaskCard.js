import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Calendar, Tag, ListTodo } from 'lucide-react';

const PRIORITY_COLORS = {
  Critical: 'bg-red-500/10 text-red-500 border-red-500/20',
  High: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  Medium: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  Low: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
};

const TaskCard = ({ task, onClick, isOverlay }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const cardClasses = `
    bg-background-card border border-slate-700/60 p-4 rounded-lg 
    cursor-grab active:cursor-grabbing hover:border-slate-500 
    transition-all-150 group shadow-sm
    ${isDragging && !isOverlay ? 'opacity-30' : 'opacity-100'}
    ${isOverlay ? 'shadow-2xl border-indigo-500/50 rotate-2' : ''}
  `;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cardClasses}
      onClick={(e) => {
        // Prevent drag click from triggering opening if moved
        if (onClick) onClick();
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${PRIORITY_COLORS[task.priority]}`}>
          {task.priority}
        </span>
        <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400">
          {task.id}
        </span>
      </div>

      <h4 className="text-sm font-medium text-slate-200 mb-4 leading-snug group-hover:text-white transition-colors">
        {task.title}
      </h4>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {task.tags?.map(tag => (
          <span key={tag} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-background-base text-[10px] font-medium text-slate-400 border border-slate-800">
            <Tag className="w-2.5 h-2.5" />
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-background-base/30 border border-slate-700/50">
          <ListTodo className="w-3 h-3 text-slate-500" />
          <span className="text-[10px] font-bold text-slate-400">{task.points || 5}</span>
        </div>
        
        {task.dueDate && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-background-base/30 border border-slate-700/50">
            <Calendar className="w-3 h-3 text-indigo-500/70" />
            <span className="text-[10px] font-bold text-slate-400">
              {new Date(task.dueDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
            </span>
          </div>
        )}
        
        <div className="w-6 h-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-100 shadow-sm" title={task.assigneeName || 'Unassigned'}>
          {task.assignee}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
