import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import useAnalyticsData from './useAnalyticsData';
import InsightEngine from './components/analytics/InsightEngine';

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsDashboard() {
  const { data, loading, error } = useAnalyticsData();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Crunching analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 text-rose-600 rounded-2xl border border-rose-200 font-medium shadow-sm">
        <p className="flex items-center gap-2"><span>⚠️</span> {error}</p>
      </div>
    );
  }

  // 1. Prepare Metric Card Data (Aggregating Project Data)
  const totalTasks = data.projectOverview.reduce((acc, p) => acc + p.total_tasks, 0);
  const totalCompleted = data.projectOverview.reduce((acc, p) => acc + p.completed_tasks, 0);
  
  const activeProductivityScore = data.userProductivity.length > 0 
    ? Math.round(data.userProductivity.reduce((acc, u) => acc + (u.productivity_score || 0), 0) / data.userProductivity.length)
    : 0;

  // 2. Prepare Pie Chart Data (Task Status Summary)
  const pieData = {
    labels: ['To Do', 'In Progress', 'Code Review', 'Done'],
    datasets: [{
      data: [
        data.statusSummary.todo || 0,
        data.statusSummary.in_progress || 0,
        data.statusSummary.review || 0,
        data.statusSummary.done || 0
      ],
      backgroundColor: [
        'rgba(71, 85, 105, 0.8)', // slate-600
        'rgba(56, 189, 248, 0.8)', // cyan-400
        'rgba(168, 85, 247, 0.8)', // purple-500
        'rgba(16, 185, 129, 0.8)'  // emerald-500
      ],
      borderWidth: 2,
      borderColor: '#0f172a',
      hoverOffset: 12
    }]
  };

  // 3. Prepare Bar Chart Data (User Productivity)
  const userProdData = {
    labels: data.userProductivity.map(u => u.username),
    datasets: [{
      label: 'Completed Tasks',
      data: data.userProductivity.map(u => u.completed_tasks),
      backgroundColor: 'rgba(56, 189, 248, 0.7)',
      hoverBackgroundColor: 'rgba(56, 189, 248, 1)',
      borderColor: 'rgba(56, 189, 248, 1)',
      borderWidth: 1,
      borderRadius: 10,
      borderSkipped: false,
    }]
  };

  // 4. Prepare Line Chart Data (Completion Trend)
  const trendData = {
    labels: data.completionTrend.map(t => new Date(t.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Tasks Completed',
      data: data.completionTrend.map(t => t.completed_tasks),
      borderColor: 'rgba(168, 85, 247, 1)', 
      backgroundColor: 'rgba(168, 85, 247, 0.15)',
      borderWidth: 4,
      tension: 0.45, 
      fill: true,
      pointBackgroundColor: 'rgba(168, 85, 247, 1)',
      pointBorderColor: '#0f172a',
      pointBorderWidth: 3,
      pointRadius: 6,
      pointHoverRadius: 9,
    }]
  };

  // Common Tooltip options
  const tooltipOptions = {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    padding: 16,
    cornerRadius: 12,
    titleFont: { size: 14, family: 'Inter, sans-serif', weight: 'bold' },
    bodyFont: { size: 13, family: 'Inter, sans-serif' },
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  };

  const chartScales = {
    y: { 
      beginAtZero: true, 
      border: { display: false }, 
      grid: { color: 'rgba(255, 255, 255, 0.05)', drawTicks: false }, 
      ticks: { color: 'rgba(148, 163, 184, 0.8)', font: { weight: 'bold' }, stepSize: 1 } 
    },
    x: { 
      border: { display: false }, 
      grid: { display: false },
      ticks: { color: 'rgba(148, 163, 184, 0.8)', font: { weight: 'bold' } }
    }
  };

  return (
    <div className="py-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* AI Behavioral Insights Engine */}
      <InsightEngine />

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0F172A]/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[#1E293B] flex items-center justify-between transition-all hover:border-[#38BDF8]/40 hover:shadow-[0_0_20px_rgba(56,189,248,0.1)] cursor-default">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Total Tasks</p>
            <h3 className="text-4xl font-black text-slate-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">{totalTasks}</h3>
          </div>
          <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-2xl shadow-inner">📋</div>
        </div>

        <div className="bg-[#0F172A]/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[#1E293B] flex items-center justify-between transition-all hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] cursor-default">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Items Completed</p>
            <h3 className="text-4xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">{totalCompleted}</h3>
          </div>
          <div className="w-14 h-14 bg-emerald-950/30 border border-emerald-900/30 rounded-2xl flex items-center justify-center text-2xl shadow-inner">✅</div>
        </div>

        <div className="bg-gradient-to-br from-indigo-700 to-blue-900 p-6 rounded-2xl shadow-2xl border border-blue-500/40 flex items-center justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] mb-1">Avg Efficiency</p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-4xl font-black text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">{activeProductivityScore}</h3>
              <span className="text-lg font-black text-blue-300">/100</span>
            </div>
          </div>
          <div className="relative z-10 w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/10">🚀</div>
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#38BDF8]/10 blur-2xl group-hover:bg-[#38BDF8]/20 transition-all duration-700" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-indigo-400/10 blur-xl" />
        </div>
      </div>

      {/* Middle Row: Pie Chart (Task Status) and Bar Chart (User Productivity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Pie Chart (Task Status) */}
        <div className="bg-[#0F172A]/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[#1E293B] lg:col-span-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-[13px] font-black text-slate-200 uppercase tracking-widest">Status Matrix</h4>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Live DB Distribution</p>
            </div>
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-slate-600 text-sm shadow-inner">🥧</div>
          </div>
          <div className="flex-1 relative w-full flex items-center justify-center min-h-[250px]">
            {totalTasks === 0 ? (
               <p className="text-slate-600 font-black uppercase text-xs tracking-widest">Zero Data</p>
            ) : (
              <Pie 
                data={pieData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { 
                    tooltip: tooltipOptions, 
                    legend: { 
                      position: 'bottom', 
                      labels: { 
                        usePointStyle: true, 
                        color: 'rgba(148, 163, 184, 0.8)',
                        font: { family: 'Inter', weight: 'bold', size: 10 } 
                      } 
                    } 
                  }
                }} 
              />
            )}
          </div>
        </div>

        {/* Bar Chart (User Productivity) */}
        <div className="bg-[#0F172A]/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[#1E293B] lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-[13px] font-black text-slate-200 uppercase tracking-widest">Team Throughput</h4>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Tasks finalized per member</p>
            </div>
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-slate-600 text-sm shadow-inner">📊</div>
          </div>
          <div className="flex-1 min-h-[250px] relative w-full">
            {data.userProductivity.length === 0 ? (
               <div className="flex items-center justify-center h-full"><p className="text-slate-600 font-black uppercase text-xs tracking-widest">No User Metrics</p></div>
            ) : (
              <Bar 
                data={userProdData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false }, tooltip: tooltipOptions },
                  scales: chartScales
                }} 
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Line Chart (Completion Trend) */}
      <div className="bg-[#0F172A]/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[#1E293B]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-[13px] font-black text-slate-200 uppercase tracking-widest">Velocity Trend</h4>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">7-Day Completion Flow</p>
            </div>
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-slate-600 text-sm shadow-inner">📈</div>
          </div>
          <div className="h-72 relative w-full">
            {data.completionTrend.length === 0 ? (
               <div className="flex items-center justify-center h-full"><p className="text-slate-600 font-black uppercase text-xs tracking-widest">Historical Void</p></div>
            ) : (
              <Line 
                data={trendData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false }, tooltip: tooltipOptions },
                  scales: chartScales
                }} 
              />
            )}
          </div>
      </div>
    </div>
  );
}
