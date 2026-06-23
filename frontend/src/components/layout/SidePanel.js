import React from 'react';
import { Layout, Calendar, List, GitBranch, Package, Settings, LogOut } from 'lucide-react';

const SidePanel = ({ activeView, onSetActiveView, onLogout }) => {
  const sections = [
    {
      title: 'Planning',
      items: [
        { id: 'Kanban Board', icon: Layout },
        { id: 'Timeline', icon: Calendar },
        { id: 'Backlog', icon: List },
      ],
    },
    {
      title: 'Development',
      items: [
        { id: 'Code + Git', icon: GitBranch, badge: 'Git' },
        { id: 'Releases', icon: Package },
      ],
    },
  ];

  return (
    <div className="w-[220px] bg-background-sidebar flex flex-col border-r border-slate-700 z-10 box-border">
      <div className="p-4 py-6">
        <h1 className="text-sm font-bold tracking-wider text-slate-400 uppercase">Teams in Space</h1>
      </div>

      <nav className="flex-1 px-2 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="px-3 mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
              {section.title}
            </h2>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSetActiveView(item.id)}
                  className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all-150 relative ${
                    activeView === item.id
                      ? 'bg-background-elevated text-white'
                      : 'text-slate-400 hover:text-white hover:bg-background-card/50'
                  }`}
                >
                  {activeView === item.id && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-indigo-500 rounded-r-full" />
                  )}
                  <item.icon className={`mr-3 h-4 w-4 shrink-0 transition-colors ${
                    activeView === item.id ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`} />
                  <span className="flex-1 text-left">{item.id}</span>
                  {item.badge && (
                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-400 uppercase tracking-tighter">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-2 mt-auto border-t border-slate-700">
        <button
          onClick={() => onSetActiveView('Project Settings')}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all-150 ${
            activeView === 'Project Settings'
              ? 'bg-background-elevated text-white'
              : 'text-slate-400 hover:text-white hover:bg-background-card/50'
          }`}
        >
          <Settings className="mr-3 h-4 w-4 text-slate-500" />
          Project Settings
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-red-500 hover:bg-red-500/10 transition-all-150 mt-1"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Terminate Session
        </button>
      </div>
    </div>
  );
};

export default SidePanel;
