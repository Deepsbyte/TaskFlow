import React, { useState, useEffect, useRef } from 'react';
import { Search, Hash, Box, Command } from 'lucide-react';

const SearchModal = ({ tasks, onClose, onSelectTask }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const results = tasks.filter(t => 
    t.title.toLowerCase().includes(query.toLowerCase()) || 
    t.id.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowDown') setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    if (e.key === 'ArrowUp') setSelectedIndex(prev => Math.max(prev - 1, 0));
    if (e.key === 'Enter' && results[selectedIndex]) onSelectTask(results[selectedIndex].id);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 backdrop-blur-sm bg-black/40 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-background-sidebar border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-4 border-b border-slate-700 gap-3">
          <Search className="w-5 h-5 text-slate-500" />
          <input 
            ref={inputRef}
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 text-base"
            placeholder="Search tasks, docs, members..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 border border-slate-700 shadow-inner">
            <span className="text-[10px] font-bold text-slate-400">ESC</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[400px] p-2 custom-scrollbar">
          {results.length > 0 ? (
            <div className="space-y-1">
              {results.map((task, index) => (
                <button
                  key={task.id}
                  onClick={() => onSelectTask(task.id)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all-150 relative ${
                    selectedIndex === index ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${selectedIndex === index ? 'bg-white/20' : 'bg-slate-800'}`}>
                    <Hash className={`w-4 h-4 ${selectedIndex === index ? 'text-white' : 'text-slate-500'}`} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-sm font-bold truncate ${selectedIndex === index ? 'text-white' : 'text-slate-200'}`}>
                        {task.title}
                      </span>
                      <span className={`text-[10px] font-mono ml-2 ${selectedIndex === index ? 'text-white/60' : 'text-slate-500'}`}>
                        {task.id}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedIndex === index ? 'text-white/80' : 'text-slate-500'}`}>
                      In {task.status} • {task.assignee}
                    </span>
                  </div>
                  {selectedIndex === index && <Command className="w-4 h-4 opacity-40 ml-auto" />}
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-3">
              <Box className="w-10 h-10 stroke-[1]" />
              <p className="text-sm font-medium">No results found for "{query}"</p>
            </div>
          )}
        </div>

        <div className="px-4 py-2 bg-background-base/50 border-t border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 grayscale opacity-50">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-300">↑↓</kbd>
              <span className="text-[10px] font-bold text-slate-500">Navigate</span>
            </div>
            <div className="flex items-center gap-1.5 grayscale opacity-50">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-300">ENTER</kbd>
              <span className="text-[10px] font-bold text-slate-500">Open</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Search Orbit — Teams in Space</span>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
