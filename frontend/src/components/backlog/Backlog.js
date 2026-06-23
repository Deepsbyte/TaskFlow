import React, { useState } from 'react';
import { Search, ArrowUpDown, MoreVertical } from 'lucide-react';
import TaskDetailDrawer from '../board/TaskDetailDrawer';

const PRIORITY_STYLES = {
  Critical: 'text-red-500 bg-red-500/10 border-red-500/20',
  High: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  Medium: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
  Low: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
};

const STATUS_STYLES = {
  'To Do': 'text-slate-400 bg-slate-400/10 border-slate-400/20',
  'In Progress': 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
  'In Review': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  'Done': 'text-green-400 bg-green-400/10 border-green-400/20',
};

const Backlog = ({ tasks, team = [], currentUser, onUpdateTask, onDeleteTask, onSelectTask }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ priority: 'All', status: 'All' });
  const [editingTask, setEditingTask] = useState(null);

  const getAssigneeName = (initials) => {
    const member = team.find(m => m.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) === initials || m.id === initials);
    return member ? member.name : 'Unknown';
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || task.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filters.priority === 'All' || task.priority === filters.priority;
    const matchesStatus = filters.status === 'All' || task.status === filters.status;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Search backlog..."
            className="w-full bg-background-sidebar border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-background-sidebar border border-slate-700 rounded-xl p-1">
            <select 
              className="bg-transparent text-xs font-bold text-slate-400 focus:ring-0 border-none px-3 cursor-pointer"
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <div className="w-[1px] h-4 bg-slate-700" />
            <select 
              className="bg-transparent text-xs font-bold text-slate-400 focus:ring-0 border-none px-3 cursor-pointer"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="All">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="In Review">In Review</option>
              <option value="Done">Done</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-background-card border border-slate-700 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700/50 bg-background-sidebar/50">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <button className="flex items-center gap-2 hover:text-white transition-colors">
                  ID <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Title</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priority</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assignee</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Pts</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Due Date</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredTasks.map((task) => (
              <tr 
                key={task.id} 
                className="group hover:bg-white/[0.02] cursor-pointer transition-colors"
                onClick={() => setEditingTask(task)}
              >
                <td className="px-6 py-4">
                  <span className="text-xs font-mono text-slate-500 group-hover:text-indigo-400">{task.id}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{task.title}</span>
                    <div className="flex gap-1">
                      {task.tags?.map(tag => (
                        <span key={tag} className="text-[10px] text-slate-600">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${PRIORITY_STYLES[task.priority]}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border uppercase tracking-widest flex items-center gap-1.5 w-fit ${STATUS_STYLES[task.status]}`}>
                    <small className="w-1.5 h-1.5 rounded-full bg-current" />
                    {task.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2" title={getAssigneeName(task.assignee)}>
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-100 border border-slate-600">
                      {task.assignee}
                    </div>
                    <span className="text-xs text-slate-500 hidden xl:inline truncate max-w-[80px]">{getAssigneeName(task.assignee)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-xs font-mono font-bold text-slate-500">{task.points || '-'}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : '—'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-white">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-slate-600 text-sm font-medium">
                  No tasks found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingTask && (
        <TaskDetailDrawer 
          task={editingTask} 
          team={team}
          currentUser={currentUser}
          onClose={() => setEditingTask(null)}
          onSave={(updatedTask) => {
            if (onUpdateTask) onUpdateTask(updatedTask);
            setEditingTask(null);
          }}
          onDelete={(taskToDelete) => {
            if (onDeleteTask) onDeleteTask(taskToDelete);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

export default Backlog;
