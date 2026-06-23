import React, { useState, useEffect } from 'react';
import api from '../../api';

export default function CreateTaskModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState('');
  const [projectId, setProjectId] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('projects/').then(res => {
      const projs = res.data.results || res.data || [];
      setProjects(projs);
      if (projs.length > 0) setProjectId(projs[0].id);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('tasks/', {
        title,
        description,
        priority,
        deadline: deadline || null,
        status: 'todo',
        project: projectId
      });
      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to create task. Check if you have Scrum Master permissions for this project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0F172A] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-[#1E293B] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-[#1E293B] flex justify-between items-center bg-[#0B1121]">
          <h2 className="text-xl font-black text-slate-100 tracking-tight drop-shadow-[0_0_8px_rgba(56,189,248,0.2)]">CREATE NEW ISSUE</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-2xl leading-none">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-[#0F172A]">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Project Instance</label>
            <select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full px-4 py-2 bg-[#0B1121] border border-[#1E293B] rounded-xl outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] font-bold text-slate-300 hover:bg-[#1E293B] transition-all">
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              {projects.length === 0 && <option value="">No Active Matrix Found...</option>}
            </select>
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Issue Descriptor <span className="text-rose-500">*</span></label>
            <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 bg-[#0B1121] border border-[#1E293B] rounded-xl outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] font-bold text-slate-100 hover:bg-[#1E293B] transition-all placeholder-slate-700 shadow-inner" placeholder="Log entry title..." />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Data Payload (Description)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 bg-[#0B1121] border border-[#1E293B] rounded-xl outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] font-bold text-slate-100 hover:bg-[#1E293B] transition-all min-h-[120px] placeholder-slate-700 shadow-inner" placeholder="Append contextual metadata here..."></textarea>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Priority Level</label>
               <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full px-4 py-2 bg-[#0B1121] border border-[#1E293B] rounded-xl outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] font-bold text-slate-300 hover:bg-[#1E293B] transition-all">
                 <option value="low">Low</option>
                 <option value="medium">Medium</option>
                 <option value="high">High</option>
               </select>
             </div>

             <div>
               <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Temporal Lock (Deadline)</label>
               <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full px-4 py-2 bg-[#0B1121] border border-[#1E293B] rounded-xl outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] font-bold text-slate-300 hover:bg-[#1E293B] transition-all [color-scheme:dark]" />
             </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[#1E293B]">
            <button type="button" onClick={onClose} className="px-5 py-2 text-slate-500 font-black text-[11px] uppercase tracking-wider hover:text-slate-200 transition-colors">Discard</button>
            <button type="submit" disabled={loading || !projectId} className="px-6 py-2 bg-[#1E293B] border border-blue-500/30 text-[#38BDF8] hover:bg-blue-900/20 font-black text-[11px] uppercase tracking-[0.2em] rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.2)] transition-all disabled:opacity-50">
              {loading ? 'Transmitting...' : 'Confirm Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
