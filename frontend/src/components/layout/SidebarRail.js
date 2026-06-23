import React from 'react';
import { Search, Plus, Settings, Box } from 'lucide-react';

const SidebarRail = ({ onSearch, onCreate, activeView, onSetActiveView, user }) => {
  const items = [
    { id: 'search', icon: Search, label: 'Search', action: onSearch },
    { id: 'create', icon: Plus, label: 'Create', action: onCreate },
    { id: 'settings', icon: Settings, label: 'Settings', action: () => onSetActiveView('Project Settings') },
  ];

  return (
    <div className="w-[60px] bg-background-sidebar flex flex-col items-center py-4 border-r border-slate-700 z-20">
      <div className="mb-8">
        <Box className="w-8 h-8 text-indigo-500" />
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={item.action}
            className="group relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-700 transition-all-150"
          >
            <item.icon className="w-5 h-5 text-slate-400 group-hover:text-white" />
            
            {/* Tooltip */}
            <div className="absolute left-[54px] px-2 py-1 bg-background-elevated border border-slate-700 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
              {item.label}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-auto">
        <div 
          className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold border border-white/20 text-white cursor-pointer hover:bg-indigo-600 transition-colors"
          title={user?.name || 'User'}
        >
          {user?.initials || '??'}
        </div>
      </div>
    </div>
  );
};

export default SidebarRail;
