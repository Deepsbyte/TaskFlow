import React, { useState, useEffect } from 'react';
import api from '../../api';

export default function InsightEngine() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch AI insights from backend analytical engine
    api.get('analytics/insights/')
       .then(res => setInsights(res.data.insights || []))
       .catch(err => console.error("Failed to fetch insights", err))
       .finally(() => setLoading(false));
  }, []);

  if (loading) {
     return (
        <div className="w-full bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 flex items-center justify-center min-h-[150px] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
           <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-900 border-t-[#38BDF8] rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.2em] animate-pulse">Initializing Behavioral Neural Link...</p>
           </div>
        </div>
     );
  }

  const getStyleForType = (type) => {
    switch(type) {
      case 'warning': return 'bg-amber-950/20 border-amber-500/30 text-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.1)]';
      case 'danger': return 'bg-rose-950/20 border-rose-500/30 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.1)]';
      case 'success': return 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200 shadow-[0_0_15px_rgba(52,211,153,0.1)]';
      case 'celebration': return 'bg-purple-950/20 border-purple-500/30 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.1)]';
      default: return 'bg-slate-900/40 border-slate-700 text-slate-300';
    }
  };

  const getIconForType = (type) => {
    switch(type) {
      case 'warning': return '⚠️';
      case 'danger': return '🚨';
      case 'success': return '✨';
      case 'celebration': return '🎉';
      default: return '💡';
    }
  };

  return (
    <div className="w-full bg-[#0B1121]/80 backdrop-blur-md border border-[#1E293B] rounded-2xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] mb-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-[80px] -mr-16 -mt-16 opacity-60"></div>
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
         <div className="w-10 h-10 bg-slate-900 border border-[#1E293B] flex items-center justify-center rounded-xl text-xl shadow-inner">🤖</div>
         <div>
            <h3 className="text-sm font-black text-slate-100 tracking-[0.1em] uppercase">AI Optimization Engine</h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Behavioral Analysis</p>
         </div>
         <span className="ml-auto px-2 py-0.5 bg-[#1E293B] text-[#38BDF8] text-[9px] font-black uppercase tracking-widest rounded border border-blue-500/20 shadow-md">Mainframe Beta</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {insights.map((insight, idx) => (
           <div key={idx} className={`p-4 rounded-xl border flex gap-4 items-start transition-all hover:-translate-y-1 ${getStyleForType(insight.type)}`}>
              <div className="text-2xl mt-0.5 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{getIconForType(insight.type)}</div>
              <div>
                 <h4 className="font-black text-xs uppercase tracking-wider mb-1 drop-shadow-sm">{insight.title}</h4>
                 <p className="text-[11px] font-bold opacity-80 leading-relaxed tracking-wide">{insight.message}</p>
              </div>
           </div>
        ))}
        {insights.length === 0 && (
           <div className="col-span-2 p-8 border border-dashed border-[#1E293B] rounded-xl flex items-center justify-center">
              <p className="text-[11px] text-slate-600 font-black uppercase tracking-[0.2em] italic">Zero behavioral anomalies detected in current cycle.</p>
           </div>
        )}
      </div>
    </div>
  );
}
