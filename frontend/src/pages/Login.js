import React, { useState } from 'react';
import api from '../api';

export default function Login({ onLogin }) {
  const [loginField, setLoginField] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("auth/login/", { login: loginField, password });
      localStorage.setItem("access", res.data.access);
      onLogin();
    } catch (err) {
      setError("Invalid credentials. Please verify your access restrictions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full"></div>
      
      <div className="bg-[#0F172A]/80 backdrop-blur-xl max-w-[420px] w-full p-10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-[#1E293B] relative z-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#38BDF8] to-transparent shadow-[0_0_15px_rgba(56,189,248,0.5)]"></div>
        
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-[#0B1121] border border-[#1E293B] rounded-2xl flex items-center justify-center mb-6 shadow-2xl text-white text-3xl font-bold group transition-transform hover:scale-110">
             <span className="drop-shadow-[0_0_10px_rgba(59,130,246,0.5)] group-hover:drop-shadow-[0_0_15px_rgba(56,189,248,0.8)]">🚀</span>
          </div>
          <h2 className="text-2xl font-black text-slate-100 tracking-[0.1em] uppercase drop-shadow-md">MAINFRAME ACCESS</h2>
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mt-2">Enterprise Behavioral Analytics</p>
        </div>

        {error && <div className="mb-6 p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-widest flex items-center gap-2 animate-shake">🚨 {error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              required
              className="w-full px-5 py-4 bg-[#0B1121] border border-[#1E293B] rounded-xl focus:border-[#38BDF8] focus:ring-2 focus:ring-blue-500/10 outline-none transition-all text-slate-100 font-bold placeholder-slate-700 shadow-inner"
              placeholder="Username or Identifier"
              value={loginField}
              onChange={(e) => setLoginField(e.target.value)}
            />
          </div>
          <div>
            <input
              type="password"
              required
              className="w-full px-5 py-4 bg-[#0B1121] border border-[#1E293B] rounded-xl focus:border-[#38BDF8] focus:ring-2 focus:ring-blue-500/10 outline-none transition-all text-slate-100 font-bold placeholder-slate-700 shadow-inner"
              placeholder="Authorization Key"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-transparent border border-[#38BDF8] text-[#38BDF8] hover:bg-blue-600/10 active:scale-95 font-black text-sm uppercase tracking-[0.3em] rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.2)] hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] transition-all flex justify-center disabled:opacity-50 mt-6"
          >
            {loading ? <div className="w-6 h-6 border-2 border-[#38BDF8] border-t-transparent rounded-full animate-spin"></div> : "DECRYPT"}
          </button>
        </form>
      </div>
    </div>
  );
}
