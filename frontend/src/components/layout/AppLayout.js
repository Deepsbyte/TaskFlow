import React from 'react';
import Sidebar from './Sidebar';

export default function AppLayout({ children, onLogout }) {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* Global Jira Navigation Strip (Cyberpunk Black/Blue) */}
      <div className="w-16 bg-[#0B1121] flex flex-col items-center py-6 border-r border-[#1E293B] z-50">
         <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mb-8 flex items-center justify-center font-black text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] tracking-tighter">
            TF
         </div>
         <div className="flex flex-col gap-6 w-full px-3">
             <div className="text-[#38BDF8] text-2xl flex justify-center cursor-pointer hover:shadow-[0_0_10px_rgba(56,189,248,0.8)] hover:-translate-y-0.5 transition-all w-full rounded-lg py-2">🔍</div>
             <div className="text-slate-500 text-2xl flex justify-center cursor-pointer hover:text-white transition-all w-full rounded-lg py-2">➕</div>
         </div>
         <div className="mt-auto flex flex-col gap-6 w-full px-3">
             <div className="text-slate-500 text-2xl flex justify-center cursor-pointer hover:text-white transition-all w-full py-2">⚙️</div>
             <div 
               onClick={onLogout}
               title="Terminate Session"
               className="w-8 h-8 rounded-full bg-slate-800 border-2 border-[#1E293B] flex items-center justify-center text-xs font-bold text-white shadow-md mx-auto mb-2 cursor-pointer hover:border-rose-500 transition-colors overflow-hidden"
             >
                <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=Admin`} alt="avatar" />
             </div>
         </div>
      </div>

      <Sidebar onLogout={onLogout} />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-screen relative bg-slate-950 overflow-hidden">
         {/* Cyberpunk Grid Background Overlay */}
         <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#38BDF8 1px, transparent 1px), linear-gradient(90deg, #38BDF8 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
         
         {/* Ambient Glows */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none"></div>
         <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none"></div>

         <div className="flex-1 overflow-y-auto z-10 p-2 lg:p-6 custom-scrollbar">
            {children}
         </div>
      </div>
    </div>
  );
}
