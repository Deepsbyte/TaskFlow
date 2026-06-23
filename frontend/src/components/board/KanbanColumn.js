import React, { useEffect, useRef, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus, MoreHorizontal } from 'lucide-react';
import TaskCard from './TaskCard';

const KanbanColumn = ({ id, title, tasks, onSelectTask, onCreateTask }) => {
  const { setNodeRef } = useDroppable({ id });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const menuRef = useRef(null);

  const displayTitle = customTitle || title;

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isMenuOpen]);

  const handleRenameColumn = () => {
    const nextTitle = window.prompt('Rename column', displayTitle);
    if (nextTitle === null) return;
    const trimmed = nextTitle.trim();
    if (!trimmed) return;
    setCustomTitle(trimmed);
    setIsMenuOpen(false);
  };

  return (
    <div className="flex flex-col w-[300px] min-w-[300px]">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">{displayTitle}</h3>
          <span className="px-2 py-0.5 rounded-full bg-slate-700 text-[10px] font-bold text-slate-400">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1 relative" ref={menuRef}>
          <button onClick={onCreateTask} className="p-1 hover:bg-slate-700 rounded text-slate-500 hover:text-slate-300 transition-all-150" title="Create task">
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMenuOpen(prev => !prev)}
            className="p-1 hover:bg-slate-700 rounded text-slate-500 hover:text-slate-300 transition-all-150"
            title="Column options"
            type="button"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 top-8 z-20 min-w-[170px] rounded-lg border border-slate-700 bg-slate-900 p-1 shadow-xl">
              <button
                onClick={handleRenameColumn}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded"
                type="button"
              >
                Rename Column
              </button>
              <button
                onClick={() => {
                  setIsCollapsed(prev => !prev);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded"
                type="button"
              >
                {isCollapsed ? 'Expand Column' : 'Collapse Column'}
              </button>
              <button
                onClick={() => {
                  setCustomTitle('');
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded"
                type="button"
                disabled={!customTitle}
              >
                Reset Name
              </button>
            </div>
          )}
        </div>
      </div>

      <div 
        ref={setNodeRef}
        className="flex-1 flex flex-col gap-3 p-2 rounded-xl bg-background-sidebar/30 border border-transparent hover:border-slate-700/50 transition-colors custom-scrollbar overflow-y-auto"
      >
        {isCollapsed ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
            <span className="text-xs font-semibold text-slate-600">Column collapsed</span>
          </div>
        ) : (
          <>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={() => onSelectTask(task)} />
        ))}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
            <span className="text-xs font-semibold text-slate-600">No tasks in this stage</span>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
