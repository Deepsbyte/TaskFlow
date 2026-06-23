import React, { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import KanbanBoard from '../components/board/KanbanBoard';
import CalendarView from '../components/board/CalendarView';
import AnalyticsDashboard from '../Analytics';
import useTasks from '../hooks/useTasks';

export default function Dashboard({ onLogout }) {
   const [activeTab, setActiveTab] = useState('board');
   const { data: taskData } = useTasks();
   const allTasks = Object.values(taskData || {}).flat();

   return (
      <AppLayout onLogout={onLogout}>
         <div className="flex flex-col w-full h-full">
            <div className="px-8 pt-4 pb-2 flex items-center mb-4">
               <div className="bg-[#0F172A] p-1 rounded-xl flex shadow-inner border border-[#1E293B]">
                  <button onClick={() => setActiveTab('board')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'board' ? 'bg-[#1E293B] text-[#38BDF8] shadow-[0_0_10px_rgba(56,189,248,0.2)] pointer-events-none' : 'text-slate-500 hover:text-slate-300 hover:bg-[#1E293B]/50'}`}>📋 Board</button>
                  <button onClick={() => setActiveTab('calendar')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'calendar' ? 'bg-[#1E293B] text-[#38BDF8] shadow-[0_0_10px_rgba(56,189,248,0.2)] pointer-events-none' : 'text-slate-500 hover:text-slate-300 hover:bg-[#1E293B]/50'}`}>📅 Calendar</button>
               </div>
            </div>

            {activeTab === 'board' ? <KanbanBoard /> : <div className="px-8"><CalendarView tasks={allTasks} /></div>}
            
            {/* Analytics Section - rendered seamlessly below board */}
            <div className="p-8 border-t border-[#1E293B] mt-4 bg-slate-900/40 backdrop-blur-sm z-10 relative">
               <h2 className="text-2xl font-black text-slate-200 tracking-tight mb-8 drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">EXECUTIVE ANALYTICS</h2>
               <AnalyticsDashboard />
            </div>
         </div>
      </AppLayout>
   );
}
