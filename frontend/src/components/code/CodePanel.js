import React, { useState } from 'react';
import { GitCommit, GitBranch, GitPullRequest, Clock, MessageSquare, CheckCircle2, MoreVertical } from 'lucide-react';

const CodePanel = ({ commits, prs }) => {
  const [activeTab, setActiveTab] = useState('Commits');

  const tabs = [
    { id: 'Commits', icon: GitCommit, count: commits.length },
    { id: 'Branches', icon: GitBranch, count: 4 },
    { id: 'Pull Requests', icon: GitPullRequest, count: prs.length },
  ];

  return (
    <div className="flex flex-col h-full bg-background-base">
      {/* Tabs */}
      <div className="px-6 border-b border-slate-700 flex items-center gap-8 bg-background-base">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all-150 ${
              activeTab === tab.id
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.id}
            <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-500">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-6 custom-scrollbar">
        {activeTab === 'Commits' && (
          <div className="space-y-1">
            {commits.map((commit) => (
              <div key={commit.hash} className="group flex items-center gap-4 p-4 bg-background-card/40 hover:bg-background-card border border-slate-800 hover:border-slate-700 rounded-lg transition-all-150">
                <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center border border-slate-700">
                  <GitCommit className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">{commit.message}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                    <span className="text-indigo-400 font-mono">{commit.hash}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {commit.time}</span>
                    <span>by {commit.author}</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-600">
                  {commit.author}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Pull Requests' && (
          <div className="space-y-4">
            {prs.map((pr) => (
              <div key={pr.id} className="group p-4 bg-background-card border border-slate-700 rounded-xl hover:border-indigo-500/50 transition-all-150 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <GitPullRequest className="w-4 h-4 text-green-500" />
                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{pr.title}</h4>
                    <span className="text-[10px] font-mono text-slate-500">#{pr.id}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-[10px] font-extrabold uppercase tracking-widest border border-green-500/20">
                    {pr.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex -space-x-1.5">
                      {['JS', 'MK'].map((it) => (
                        <div key={it} className="w-5 h-5 rounded-full bg-slate-700 border border-background-card flex items-center justify-center text-[8px] font-bold text-slate-400">
                          {it}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MessageSquare className="w-3 h-3" />
                      <span className="text-[10px] font-bold">{pr.comments} comments</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="text-[10px] font-bold">{pr.reviews} reviews</span>
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Opened 3 days ago by {pr.author}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Branches' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['main', 'develop', 'feat/orbital-landing', 'fix/fuel-sensor'].map((branch) => (
              <div key={branch} className="flex items-center justify-between p-4 bg-background-card/50 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <GitBranch className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-mono font-bold text-slate-300">{branch}</span>
                  {branch === 'main' && <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] text-slate-500 font-bold uppercase tracking-widest">Default</span>}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Active</span>
                  <button className="text-slate-500 hover:text-white"><MoreVertical className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodePanel;
