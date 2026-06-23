import React from 'react';
import { Cpu, CheckCircle2, ListTodo, Zap } from 'lucide-react';

const ExecutiveAnalytics = ({ tasks = [] }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === 'Done').length;
  const inProgressTasks = tasks.filter((task) => task.status === 'In Progress').length;
  const reviewTasks = tasks.filter((task) => task.status === 'Code Review' || task.status === 'In Review').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const efficiencyScore = totalTasks > 0
    ? Math.min(100, Math.round((((completedTasks * 1.0) + (reviewTasks * 0.6) + (inProgressTasks * 0.3)) / totalTasks) * 100))
    : 0;

  const queueStatusMessage = completionRate >= 70
    ? 'Optimal throughput maintained across all mission parameters.'
    : 'Queue building up. Consider moving high-priority tasks forward.';

  const workflowPacingMessage = reviewTasks > 2
    ? 'Review queue is growing. Assign more reviewers to reduce latency.'
    : 'Workflow pacing is stable across active columns.';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* AI Optimization Engine */}
      <div className="bg-background-card border border-slate-700 rounded-xl p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-1">
          <Cpu className="w-4 h-4 text-cyan-500" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Optimization Engine</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 flex-1">
          <div className="bg-background-base/50 p-3 rounded-lg border border-slate-700/50">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[10px] font-bold text-slate-300 uppercase">Queue Status</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">{queueStatusMessage}</p>
          </div>
          
          <div className="bg-background-base/50 p-3 rounded-lg border border-slate-700/50">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-300 uppercase">Workflow Pacing</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">{workflowPacingMessage}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-background-card border border-slate-700 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Tasks</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-light text-white">{totalTasks}</span>
            <ListTodo className="w-4 h-4 text-indigo-500/50 ml-auto" />
          </div>
        </div>

        <div className="bg-background-card border border-slate-700 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Completed</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-light text-white">{completedTasks}</span>
            <span className="text-xs font-bold text-green-500">{completionRate}%</span>
            <CheckCircle2 className="w-4 h-4 text-green-500/30 ml-auto" />
          </div>
        </div>

        <div className="bg-background-card border border-slate-700 rounded-xl p-4 flex flex-col justify-between overflow-hidden relative">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Efficiency</span>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-light text-white">{efficiencyScore}</span>
            <div className="relative w-10 h-10 ml-auto">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-slate-800" />
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2" fill="transparent" strokeDasharray="100" strokeDashoffset={100 - efficiencyScore} className="text-cyan-500" />
              </svg>
              <Zap className="w-3 h-3 text-cyan-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveAnalytics;
