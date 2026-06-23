import React, { useState } from 'react';
import { Settings as SettingsIcon, Users, Bell, Globe, Shield, GitBranch, MessageSquare, Save, CheckCircle2 } from 'lucide-react';

const SettingsPanel = ({ team }) => {
  const [activeSection, setActiveSection] = useState('General');

  const sections = [
    { id: 'General', icon: SettingsIcon },
    { id: 'Members', icon: Users },
    { id: 'Notifications', icon: Bell },
    { id: 'Integrations', icon: Globe },
  ];

  return (
    <div className="flex h-full bg-background-base overflow-hidden">
      {/* Settings Navigation */}
      <div className="w-[200px] border-r border-slate-700/50 p-6 space-y-2 shrink-0">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6 px-3">Project Settings</h3>
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all-150 ${
              activeSection === section.id
                ? 'bg-background-elevated text-white ring-1 ring-slate-700'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
            }`}
          >
            <section.icon className={`w-4 h-4 ${activeSection === section.id ? 'text-indigo-400' : 'text-slate-600'}`} />
            {section.id}
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {activeSection === 'General' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">General Configuration</h2>
                <p className="text-sm text-slate-500">Manage your project identity and mission parameters.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Project Name</label>
                  <input 
                    className="w-full bg-background-card border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                    defaultValue="Teams in Space"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Project Description</label>
                  <textarea 
                    className="w-full bg-background-card border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all h-24 resize-none"
                    defaultValue="Advanced trajectory planning and resource management for deep space exploration missions."
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'Members' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Mission Control Team</h2>
                  <p className="text-sm text-slate-500">Manage user access levels and permissions.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition-colors">
                   Invite Member
                </button>
              </div>

              <div className="bg-background-card border border-slate-700 rounded-2xl overflow-hidden divide-y divide-slate-800">
                {team.map((member) => {
                  const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                  const isScrumMaster = member.role.toLowerCase().includes('scrum') || member.role === 'Admin';
                  
                  return (
                    <div key={member.id} className="p-4 flex items-center justify-between group hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-100 border border-slate-600 shadow-inner">
                          {initials || member.id.toString().substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{member.name}</p>
                          <p className="text-xs text-slate-500">{member.email || member.id + '@space.com'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isScrumMaster ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {member.role}
                        </span>
                        <Shield className="w-4 h-4 text-slate-700 group-hover:text-slate-500 transition-colors cursor-pointer" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeSection === 'Notifications' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Telemetry Alerts</h2>
                <p className="text-sm text-slate-500">Configure how you receive mission updates.</p>
              </div>

              <div className="space-y-4">
                {[
                  { title: 'New Task Assignment', desc: 'Notify me when I am assigned to a new mission task.' },
                  { title: 'Status Changes', desc: 'Alert me when a task moves between pipeline stages.' },
                  { title: 'Critical Warnings', desc: 'Immediate notification for high-priority mission blocks.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-background-card border border-slate-700 rounded-xl">
                    <div className="flex-1 pr-6">
                      <p className="text-sm font-bold text-white mb-1">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <div className="w-10 h-5 bg-indigo-500 rounded-full relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'Integrations' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Connected Systems</h2>
                <p className="text-sm text-slate-500">Sync mission data with external telemetry tools.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="p-6 bg-background-card border border-slate-700 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                      <GitBranch className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">GitHub Enterprise</p>
                      <p className="text-[11px] text-green-500 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1.5 font-mono">
                        <CheckCircle2 className="w-3 h-3" /> Connected
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-slate-700 text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors">Configure</button>
                </div>

                <div className="p-6 bg-background-card border border-slate-700 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Slack Operations</p>
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 font-mono">Not Connected</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-indigo-500 text-white text-xs font-bold rounded-lg hover:bg-indigo-600 transition-colors">Connect</button>
                </div>
              </div>
            </div>
          )}

          <div className="pt-12 border-t border-slate-700/50 flex items-center justify-end gap-4">
             <button className="text-sm font-bold text-slate-500 hover:text-white transition-colors">Discard Changes</button>
             <button className="px-8 py-3 bg-indigo-500 text-white text-sm font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
               <Save className="w-4 h-4" />
               Update Parameters
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
