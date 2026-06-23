import React, { useState } from 'react';
import { X, Calendar, User, Tag, Trash2, Send } from 'lucide-react';

const TaskDetailDrawer = ({ task, team = [], currentUser, onClose, onSave, onDelete }) => {
  const [editedTask, setEditedTask] = useState({ ...task });

  const getMemberFromInitials = (initials) => {
    return team.find(m => m.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) === initials);
  };

  const assignee = team.find(m => m.id === task.assigneeId) || getMemberFromInitials(task.assignee);
  const assigneeName = assignee ? assignee.name : 'Unassigned';

  const handleSave = () => {
    onSave(editedTask);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(editedTask);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div 
        className="w-full max-w-[500px] h-full bg-background-sidebar border-l border-slate-700 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-background-base/50">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-500 uppercase">{editedTask.id}</span>
            <div className="h-4 w-[1px] bg-slate-700" />
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{editedTask.status}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-700 text-slate-500 hover:text-white rounded transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div>
            <textarea
              className="w-full bg-transparent text-2xl font-bold text-white resize-none border-none focus:ring-0 p-0 placeholder-slate-600"
              value={editedTask.title}
              onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-6">
            <div className="space-y-4">
              <label className="flex items-center gap-3 text-slate-500">
                <User className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Assignee</span>
              </label>
              <div className="flex items-center gap-3 bg-background-card/50 p-2 rounded-lg border border-slate-700/50">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-100 border border-slate-600">
                  {editedTask.assignee}
                </div>
                <span className="text-sm text-slate-300 font-medium">{assigneeName}</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 text-slate-500">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Due Date</span>
              </label>
              <input 
                type="date"
                className="w-full bg-background-card/50 border border-slate-700/50 rounded-lg p-2 text-sm text-slate-300 focus:border-indigo-500/50 focus:ring-0 outline-none"
                value={editedTask.dueDate}
                onChange={(e) => setEditedTask({...editedTask, dueDate: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 text-slate-500">
              <Tag className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Description</span>
            </label>
            <textarea
              className="w-full h-32 bg-background-card/50 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-300 focus:border-indigo-500/50 focus:ring-0 outline-none resize-none leading-relaxed"
              value={editedTask.description}
              onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
              placeholder="Add a more detailed description..."
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Comments</label>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-lg shadow-indigo-500/20">
                 {currentUser?.initials || '??'}
              </div>
              <div className="flex-1 bg-background-card/50 border border-slate-700/50 rounded-xl p-1 pr-1 flex items-center">
                <input 
                  className="flex-1 bg-transparent border-none focus:ring-0 p-2 text-xs text-slate-300"
                  placeholder="Write a comment..."
                />
                <button className="p-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors">
                  <Send className="w-3 h-3 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 flex items-center justify-end gap-3 bg-background-base/50">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailDrawer;
