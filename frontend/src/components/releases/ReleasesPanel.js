import React, { useState } from 'react';
import { Package, ChevronRight, ChevronDown, Calendar, CheckCircle2, Rocket, Clock } from 'lucide-react';

const STATUS_ICONS = {
  'Released': { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20' },
  'In Progress': { icon: Rocket, color: 'text-indigo-500', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  'Planned': { icon: Clock, color: 'text-slate-500', bg: 'bg-slate-500/10 border-slate-700' },
};

const ReleasesPanel = ({ releases }) => {
  const [expandedVersion, setExpandedVersion] = useState('v1.1.0');

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-white tracking-tight">Release Management</h2>
        <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2">
          <Rocket className="w-3.5 h-3.5" />
          Create New Release
        </button>
      </div>

      <div className="space-y-4">
        {releases.map((release) => {
          const isExpanded = expandedVersion === release.version;
          const status = STATUS_ICONS[release.status] || STATUS_ICONS['Planned'];

          return (
            <div 
              key={release.version}
              className={`bg-background-card border border-slate-700 rounded-xl overflow-hidden transition-all-150 ${isExpanded ? 'ring-1 ring-indigo-500/30' : ''}`}
            >
              <div 
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 transition-colors"
                onClick={() => setExpandedVersion(isExpanded ? null : release.version)}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${status.bg}`}>
                    <status.icon className={`w-5 h-5 ${status.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-none mb-1">{release.version}</h3>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {release.date}</span>
                      <span className="flex items-center gap-1.5"><Package className="w-3 h-3" /> {release.tasks} tasks</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-widest border ${status.bg} ${status.color}`}>
                    {release.status}
                  </span>
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-6 bg-background-base/30 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="pt-4 border-t border-slate-700/50">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Changelog</h4>
                    <ul className="space-y-3">
                      {release.changelog.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                          <span className="text-sm text-slate-300 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-slate-700/50 flex items-center justify-between">
                    <div className="flex -space-x-2">
                       {['JS', 'MK', 'AL'].map((it) => (
                        <div key={it} className="w-6 h-6 rounded-full bg-slate-800 border-2 border-background-card flex items-center justify-center text-[8px] font-bold text-slate-400">
                          {it}
                        </div>
                      ))}
                    </div>
                    <button className="text-xs font-bold text-slate-500 hover:text-white transition-colors">View Release Notes</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReleasesPanel;
