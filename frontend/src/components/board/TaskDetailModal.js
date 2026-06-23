import React, { useState, useEffect } from 'react';
import api from '../../api';

export default function TaskDetailModal({ task, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!task) return;
    api.get(`tasks/${task.id}/comments/`).then(res => {
      setComments(res.data.results || res.data || []);
    });
  }, [task]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const res = await api.post(`tasks/${task.id}/comments/`, { content: newComment });
      setComments([...comments, res.data]);
      setNewComment('');
    } catch (err) {
      console.error(err);
      alert("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  if (!task) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0F172A] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-[#1E293B] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1E293B] flex justify-between items-center bg-[#0B1121] shrink-0">
          <div className="flex gap-3 items-center">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-[#38BDF8] cursor-pointer transition-colors drop-shadow-md">TIS-{task.id}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#1E293B]"></div>
            <span className="inline-block bg-blue-900/30 text-[#38BDF8] border border-blue-500/20 text-[9px] uppercase font-black px-2 py-0.5 rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
               {task.project_name || "SPACE TRAVEL PARTNERS"}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-2xl leading-none px-2 focus:outline-none">&times;</button>
        </div>
        
        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <h2 className="text-2xl font-black text-slate-100 tracking-tight leading-snug mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">{task.title}</h2>
          
          <div className="mb-10">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">System Description</h3>
            <div className="text-[13px] leading-relaxed text-slate-300 bg-[#0B1121] p-4 rounded-xl border border-[#1E293B] font-bold whitespace-pre-wrap shadow-inner">
               {task.description || <span className="text-slate-600 italic">No telemetry data found. Append details below.</span>}
            </div>
          </div>

          <div>
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-5 border-b border-[#1E293B] pb-2">Log Activity & Communication</h3>
             
             {/* Comments List */}
             <div className="space-y-6 mb-8">
               {comments.length === 0 && <p className="text-slate-600 text-[11px] font-black uppercase tracking-widest italic ml-1">Historical link void. Initiate transmission.</p>}
               {comments.map(c => (
                 <div key={c.id} className="flex gap-3">
                   <div className="w-8 h-8 rounded bg-[#1E293B] border border-slate-700 text-slate-400 flex items-center justify-center font-black text-[10px] shrink-0 shadow-md">
                      {c.author_username ? c.author_username.charAt(0).toUpperCase() : 'U'}
                   </div>
                   <div className="flex-1">
                     <div className="flex items-baseline gap-2 mb-1">
                       <span className="font-black text-slate-300 text-[11px] uppercase tracking-wide">{c.author_username || 'Unknown Agent'}</span>
                       <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                         {new Date(c.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                       </span>
                     </div>
                     <p className="text-[13px] font-bold text-slate-300 leading-relaxed bg-[#0B1121]/80 border border-[#1E293B] shadow-inner rounded-xl py-2.5 px-3.5 inline-block">{c.content}</p>
                   </div>
                 </div>
               ))}
             </div>

             {/* Add Comment */}
             <form onSubmit={handleAddComment} className="flex gap-3 mt-4">
               <div className="w-8 h-8 rounded bg-gradient-to-tr from-[#38BDF8] to-blue-600 text-[#0F172A] flex items-center justify-center font-black text-[10px] shrink-0 shadow-[0_0_10px_rgba(56,189,248,0.4)] mt-1">ME</div>
               <div className="flex-1 border border-[#1E293B] rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-[#38BDF8] focus-within:border-[#38BDF8] transition-all bg-[#0B1121]">
                 <textarea 
                   value={newComment} 
                   onChange={e => setNewComment(e.target.value)} 
                   placeholder="Append log entry..." 
                   className="w-full text-[13px] font-bold text-slate-100 p-3 outline-none resize-none min-h-[80px] bg-[#0B1121] placeholder-slate-700"
                 />
                 <div className="bg-slate-900 mx-1 mb-1 p-2 flex justify-end rounded-lg border-t border-[#1E293B]">
                   <button type="submit" disabled={loading || !newComment.trim()} className="px-4 py-1.5 bg-[#1E293B] border border-blue-500/20 text-[#38BDF8] hover:bg-blue-900/20 font-black text-[11px] uppercase tracking-[0.2em] rounded-lg shadow-md disabled:opacity-50 transition-all">
                     {loading ? 'Transmitting...' : 'Confirm'}
                   </button>
                 </div>
               </div>
             </form>
          </div>
        </div>
      </div>
    </div>
  );
}
