'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { io } from 'socket.io-client';
import { api, BASE_URL_DIRECT } from '../../../../services/api';

const STATUS_COLOR = (s: number) => s >= 500 ? '#ef4444' : s >= 400 ? '#f59e0b' : '#10b981';

function AnimatedCounter({ value, duration = 600 }: { value: number | string, duration?: number }) {
  const isMs = typeof value === 'string' && value.endsWith('ms');
  const numValue = typeof value === 'number' ? value : parseInt(value as string) || 0;
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    const startVal = displayValue;
    const diff = numValue - startVal;
    
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(startVal + diff * ease));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [numValue]);

  if (value === '—') return <span>—</span>;
  return <span>{displayValue.toLocaleString()}{isMs ? 'ms' : ''}</span>;
}

function LivePulseBar({ paused }: { paused: boolean }) {
  return (
    <div style={{ height: 2, width: '100%', background: 'rgba(99,102,241,0.06)', position: 'relative', overflow: 'hidden' }}>
      {!paused && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '50%',
          background: 'linear-gradient(90deg, transparent, #6366f1, #c084fc, #6366f1, transparent)',
          animation: 'shimmer 1.8s infinite linear',
          backgroundSize: '200% 100%'
        }} />
      )}
    </div>
  );
}

export default function MonitorPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const [logs, setLogs] = useState<any[]>([]);
  const [paused, setPaused] = useState(false);
  const [dbLogs, setDbLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'error'>('all');
  const bottomRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    if (!projectId) return;
    loadDbLogs();
    const socket = io(BASE_URL_DIRECT);
    socket.on('connect', () => socket.emit('join-project', projectId));
    socket.on('metrics', (m: any) => {
      if (!pausedRef.current) setLogs(p => [{ ...m, id: m.id || Math.random().toString(), ts: new Date().toISOString() }, ...p].slice(0, 200));
    });
    return () => { socket.disconnect(); };
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const loadDbLogs = async () => {
    setLoading(true);
    try {
      const res = await api.analytics.logs(projectId, { limit: 100, status: filter === 'all' ? undefined : filter });
      setDbLogs(res.logs || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadDbLogs(); }, [filter]);

  const allLogs = logs.length > 0 ? logs : dbLogs;

  return (
    <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', background: '#020617', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 16, background: '#0a0f1e' }}>
        <div>
          <h1 style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9' }}>📡 Live Monitor</h1>
          <p style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>Real-time gateway request stream</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['all', 'success', 'error'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 12px', borderRadius: 7, border: `1px solid ${filter === f ? '#6366f1' : '#1e293b'}`, background: filter === f ? 'rgba(99,102,241,0.15)' : 'transparent', color: filter === f ? '#818cf8' : '#64748b', fontSize: 11, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
                {f}
              </button>
            ))}
          </div>
          <button onClick={() => setPaused(p => !p)} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${paused ? '#f59e0b' : '#1e293b'}`, background: paused ? 'rgba(245,158,11,0.1)' : 'transparent', color: paused ? '#f59e0b' : '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {paused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button onClick={() => setLogs([])} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #1e293b', background: 'transparent', color: '#64748b', fontSize: 12, cursor: 'pointer' }}>Clear</button>
          {/* Live dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: paused ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)', border: `1px solid ${paused ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: paused ? '#f59e0b' : '#10b981', animation: paused ? 'none' : 'pulseGlow 2s infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: paused ? '#f59e0b' : '#10b981' }}>{paused ? 'PAUSED' : 'LIVE'}</span>
          </div>
        </div>
      </div>

      <LivePulseBar paused={paused} />

      {/* Log table */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px', background: '#010409' }}>
        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '100px 90px 70px 180px 90px 120px 1fr', gap: 12, padding: '12px', borderBottom: '1px solid rgba(0, 242, 254, 0.2)', position: 'sticky', top: 0, background: '#010409', zIndex: 5, fontFamily: 'var(--mono)' }}>
          {['Timestamp', 'Packet', 'Method', 'Route', 'Status', 'Latency', 'Workflow'].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>{h.toUpperCase()}</span>
          ))}
        </div>

        {loading && dbLogs.length === 0 ? (
          <div style={{ padding: 24 }}>
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: 36, borderRadius: 0, marginBottom: 4 }} />)}
          </div>
        ) : allLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#334155', fontFamily: 'var(--mono)' }}>
            <div style={{ fontSize: 40, marginBottom: 12, animation: 'float 3s ease-in-out infinite' }}>📡</div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>[ SYSTEMS_IDLE // NO_TELEMETRY_FEEDS ]</p>
          </div>
        ) : (
          allLogs.map((log: any, i) => {
            const status = log.responseStatus || log.status;
            const statusColor = status >= 500 ? 'var(--neon-rose)' : status >= 400 ? 'var(--neon-amber)' : 'var(--neon-emerald)';
            const methodColor = { GET: 'var(--neon-emerald)', POST: 'var(--neon-cyan)', PUT: 'var(--neon-amber)', DELETE: 'var(--neon-rose)', PATCH: 'var(--neon-fuchsia)' }[log.method as string] || 'var(--text-secondary)';
            const latencyVal = log.latencyMs || log.latency || 0;
            const pktId = `0x${(log.id || 'FF').replace(/-/g, '').substring(0, 6).toUpperCase()}`;

            return (
              <div key={log.id || log.ts || log.timestamp || i}
                className={!paused && i === 0 ? "animate-row-flash" : ""}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 90px 70px 180px 90px 120px 1fr',
                  gap: 12,
                  padding: '10px 12px',
                  borderBottom: '1px solid rgba(255,255,255,0.02)',
                  background: i % 2 === 0 ? 'rgba(10, 15, 30, 0.4)' : 'transparent',
                  transition: 'all 0.2s',
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  alignItems: 'center',
                  borderLeft: '3px solid transparent'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(0, 242, 254, 0.05)';
                  e.currentTarget.style.borderLeftColor = 'var(--neon-cyan)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = i % 2 === 0 ? 'rgba(10, 15, 30, 0.4)' : 'transparent';
                  e.currentTarget.style.borderLeftColor = 'transparent';
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>{new Date(log.createdAt || log.ts || log.timestamp).toLocaleTimeString()}</span>
                <span style={{ color: 'var(--neon-cyan)' }}>{pktId}</span>
                <span style={{ color: methodColor, fontWeight: 800, fontSize: 10 }}>{log.method}</span>
                <span style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.path}</span>
                <span style={{ color: statusColor, fontWeight: 700 }}>{status}</span>
                
                {/* Latency with mini graphical bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: latencyVal > 500 ? 'var(--neon-amber)' : 'var(--text-secondary)', minWidth: 40 }}>{latencyVal}ms</span>
                  <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.05)', position: 'relative', width: 50 }}>
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: `${Math.min((latencyVal / 600) * 100, 100)}%`,
                      background: latencyVal > 400 ? 'var(--neon-rose)' : latencyVal > 150 ? 'var(--neon-amber)' : 'var(--neon-emerald)',
                    }} />
                  </div>
                </div>

                <span style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.workflow?.name?.toUpperCase() || log.workflowId?.substring(0, 8) || 'SANDBOX'}</span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Footer stats */}
      <div style={{ borderTop: '1px solid rgba(0, 242, 254, 0.2)', padding: '12px 24px', display: 'flex', gap: 28, background: '#0a0f1e', fontFamily: 'var(--mono)', fontSize: 11 }}>
        {[
          { label: 'TOTAL_PACKETS', value: allLogs.length, color: '#f1f5f9' },
          { label: 'STATUS_OK', value: allLogs.filter((l: any) => (l.responseStatus || l.status) < 400).length, color: 'var(--neon-emerald)' },
          { label: 'STATUS_ERR', value: allLogs.filter((l: any) => (l.responseStatus || l.status) >= 400).length, color: 'var(--neon-rose)' },
          { label: 'AVG_LATENCY', value: allLogs.length ? Math.round(allLogs.reduce((a: number, l: any) => a + (l.latencyMs || l.latency || 0), 0) / allLogs.length) + 'ms' : '—', color: 'var(--neon-amber)' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>{s.label}:</span>
            <span style={{ fontWeight: 800, color: s.color }}>
              <AnimatedCounter value={s.value} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
