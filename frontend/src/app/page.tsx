'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [backendData, setBackendData] = useState<any>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const checkConnection = async () => {
    setBackendStatus('loading');
    setErrorMsg(null);
    const start = performance.now();
    try {
      const res = await fetch('http://localhost:5000/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      const end = performance.now();
      setBackendData(data);
      setLatency(Math.round(end - start));
      setBackendStatus('success');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to fetch from backend.');
      setBackendStatus('error');
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Decorative Glowing Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl z-10 flex flex-col gap-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-950/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            System Orchestrator
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-violet-300 to-indigo-400 bg-clip-text text-transparent">
            FlowForge Platform
          </h1>
          <p className="text-slate-400 text-sm">
            Visual API Builder & Dynamic Gateway connection dashboard
          </p>
        </div>

        {/* Diagnostic Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-6">
          <h2 className="text-lg font-semibold text-slate-200 border-b border-slate-800 pb-3 flex items-center justify-between">
            Connection Diagnostics
            <button
              onClick={checkConnection}
              disabled={backendStatus === 'loading'}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-medium px-3 py-1.5 rounded-lg transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
            >
              {backendStatus === 'loading' ? 'Checking...' : 'Retest Connection'}
            </button>
          </h2>

          {/* Diagnostics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Frontend Diagnostic */}
            <div className="bg-slate-950/50 border border-slate-800/50 rounded-xl p-4 flex flex-col justify-between h-28">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Frontend Service</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Port 3000 (Next.js)</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              </div>
            </div>

            {/* Backend Diagnostic */}
            <div className="bg-slate-950/50 border border-slate-800/50 rounded-xl p-4 flex flex-col justify-between h-28">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Backend Gateway</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Port 5000 (Fastify)</span>
                {backendStatus === 'loading' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Pinging...
                  </span>
                )}
                {backendStatus === 'success' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    Connected
                  </span>
                )}
                {backendStatus === 'error' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Offline
                  </span>
                )}
                {backendStatus === 'idle' && (
                  <span className="text-xs text-slate-500">Unchecked</span>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Response Block */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Response Details</label>
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 min-h-[140px] font-mono text-xs flex flex-col justify-between">
              {backendStatus === 'loading' && (
                <div className="flex items-center justify-center flex-1 text-slate-500">
                  <span className="animate-spin mr-2">⏳</span> Querying backend API...
                </div>
              )}
              {backendStatus === 'success' && backendData && (
                <>
                  <pre className="text-indigo-300 overflow-x-auto">
                    {JSON.stringify(backendData, null, 2)}
                  </pre>
                  <div className="mt-3 pt-3 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500">
                    <span>Path: /api/health</span>
                    <span>Latency: {latency}ms</span>
                  </div>
                </>
              )}
              {backendStatus === 'error' && (
                <div className="flex flex-col justify-center flex-1 text-rose-400 gap-1.5">
                  <span className="font-semibold text-sm">⚠️ Connection Failed</span>
                  <span className="text-slate-400">{errorMsg}</span>
                  <p className="text-[10px] text-slate-500 mt-2">
                    Ensure Fastify is running locally on port 5000 (`npm run dev`) and CORS permissions allow connections.
                  </p>
                </div>
              )}
              {backendStatus === 'idle' && (
                <div className="flex items-center justify-center flex-1 text-slate-600">
                  No data loaded. Click retest to fetch metrics.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-600">
          FlowForge Architecture Template • Verified for Local Integration
        </div>
      </div>
    </main>
  );
}
