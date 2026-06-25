'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, AreaChart, Area, Cell,
} from 'recharts';
import { api } from '../../../../services/api';

const RANGE_OPTIONS = [
  { label: '24h', value: '24h' },
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
];

function AnimatedCounter({ value, suffix = '', duration = 650 }: { value: number | string, suffix?: string, duration?: number }) {
  const numValue = typeof value === 'number' ? value : parseInt(value.replace(/[^0-9]/g, '')) || 0;
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

  return <span>{displayValue.toLocaleString()}{suffix}</span>;
}

function MetricCard({ icon, label, value, sub, theme }: any) {
  // Extract number and suffix (like % or ms)
  const isPercent = typeof value === 'string' && value.includes('%');
  const isMs = typeof value === 'string' && value.includes('ms');
  const numericValue = typeof value === 'number' ? value : parseInt(value.toString().replace(/,/g, '')) || 0;
  const suffix = isPercent ? '%' : isMs ? 'ms' : '';

  const neonColor = theme === 'cyan' ? 'var(--neon-cyan)' : theme === 'emerald' ? 'var(--neon-emerald)' : theme === 'amber' ? 'var(--neon-amber)' : 'var(--neon-rose)';
  const borderShadow = theme === 'cyan' ? 'rgba(0, 242, 254, 0.08)' : theme === 'emerald' ? 'rgba(5, 255, 196, 0.08)' : theme === 'amber' ? 'rgba(255, 179, 0, 0.08)' : 'rgba(255, 46, 147, 0.08)';

  return (
    <div className="tech-corners" style={{
      background: 'rgba(10, 15, 30, 0.75)',
      border: `1.5px solid ${neonColor}`,
      outline: `1.5px solid ${borderShadow}`,
      outlineOffset: '3px',
      padding: '20px 22px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--mono)' }}>[ {label.replace(/ /g, '_')} ]</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', lineHeight: 1, fontFamily: 'var(--mono)' }}>
            <AnimatedCounter value={numericValue} suffix={suffix} />
          </div>
          {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, fontFamily: 'var(--mono)' }}>{sub.toUpperCase()}</div>}
        </div>
        <div style={{ fontSize: 24, filter: `drop-shadow(0 0 8px ${neonColor})` }}>{icon}</div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f172a', border: '1px solid rgba(0, 242, 254, 0.25)', borderRadius: 0, padding: '10px 14px', fontSize: 11, fontFamily: 'var(--mono)' }} className="tech-corners">
      <div style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color, fontWeight: 800 }}>{p.name.toUpperCase()}: {p.value}</div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const [range, setRange] = useState('7d');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    loadAnalytics();
  }, [projectId, range]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.analytics.get(projectId, { range });
      setData(res);
    } finally { setLoading(false); }
  };

  const s = data?.summary;

  return (
    <div style={{ height: 'calc(100vh - 100px)', overflowY: 'auto', background: '#020617', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(0, 242, 254, 0.15)', display: 'flex', alignItems: 'center', gap: 16, background: '#0a0f1e' }}>
        <div>
          <h1 style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9' }}>📊 Analytics</h1>
          <p style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>API traffic metrics and performance insights</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {RANGE_OPTIONS.map(r => (
            <button key={r.value} onClick={() => setRange(r.value)} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${range === r.value ? '#6366f1' : '#1e293b'}`, background: range === r.value ? 'rgba(99,102,241,0.15)' : 'transparent', color: range === r.value ? '#818cf8' : '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Summary cards */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 0 }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20 }}>
            <MetricCard icon="🔢" label="Total Requests" value={s?.totalRequests?.toLocaleString() || 0} theme="cyan" />
            <MetricCard icon="✅" label="Success Rate" value={`${s?.successRate || 100}%`} sub={`${s?.totalRequests - s?.totalErrors || 0} successful`} theme="emerald" />
            <MetricCard icon="⚡" label="Avg Latency" value={`${s?.avgLatency || 0}ms`} sub={`p95: ${s?.p95Latency || 0}ms`} theme="amber" />
            <MetricCard icon="❌" label="Error Rate" value={`${s?.errorRate || 0}%`} sub={`${s?.totalErrors || 0} errors`} theme="rose" />
          </div>
        )}

        {/* Traffic Trend */}
        <div className="cyber-plate-cyan tech-corners" style={{ padding: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--neon-cyan)', marginBottom: 20, fontFamily: 'var(--mono)' }}>[ TRAFFIC_TREND_METRICS ]</div>
          {loading ? <div className="skeleton" style={{ height: 220, borderRadius: 0 }} /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data?.dailyTrend || []}>
                <defs>
                  <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00f2fe" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#00f2fe" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff2e93" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#ff2e93" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10, fontFamily: 'var(--mono)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 10, fontFamily: 'var(--mono)' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="requests" name="Requests" stroke="var(--neon-cyan)" fill="url(#reqGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="errors" name="Errors" stroke="var(--neon-rose)" fill="url(#errGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Top Routes */}
          <div className="cyber-plate-fuchsia tech-corners" style={{ padding: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--neon-fuchsia)', marginBottom: 20, fontFamily: 'var(--mono)' }}>[ HOT_API_ROUTES ]</div>
            {loading ? <div className="skeleton" style={{ height: 200, borderRadius: 0 }} /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={(data?.topRoutes || []).slice(0, 6)} layout="vertical">
                  <XAxis type="number" tick={{ fill: '#475569', fontSize: 9, fontFamily: 'var(--mono)' }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="route" tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'var(--mono)' }} tickLine={false} axisLine={false} width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Requests" radius={[0, 4, 4, 0]}>
                    {(data?.topRoutes || []).slice(0,6).map((_: any, i: number) => (
                      <Cell key={i} fill={`rgba(243, 85, 218, ${0.4 + (i * 0.1)})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Hourly heatmap */}
          <div className="cyber-plate-emerald tech-corners" style={{ padding: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--neon-emerald)', marginBottom: 20, fontFamily: 'var(--mono)' }}>[ HOURLY_LOAD_DISTRIBUTION ]</div>
            {loading ? <div className="skeleton" style={{ height: 200, borderRadius: 0 }} /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data?.hourlyDistribution || []}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fill: '#475569', fontSize: 9, fontFamily: 'var(--mono)' }} tickLine={false} axisLine={false} tickFormatter={h => `${h}h`} />
                  <YAxis tick={{ fill: '#475569', fontSize: 9, fontFamily: 'var(--mono)' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} labelFormatter={h => `${h}:00`} />
                  <Bar dataKey="count" name="Requests" radius={[2, 2, 0, 0]}>
                    {(data?.hourlyDistribution || []).map((d: any, i: number) => (
                      <Cell key={i} fill={`rgba(5, 255, 196, ${0.2 + (d.count / (Math.max(...(data?.hourlyDistribution || []).map((x:any)=>x.count), 1))) * 0.8})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Latency trend */}
        <div className="cyber-plate-cyan tech-corners" style={{ padding: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--neon-cyan)', marginBottom: 20, fontFamily: 'var(--mono)' }}>[ RESPONSE_LATENCY_HEURISTICS ]</div>
          {loading ? <div className="skeleton" style={{ height: 180, borderRadius: 0 }} /> : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data?.dailyTrend || []}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 9, fontFamily: 'var(--mono)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 9, fontFamily: 'var(--mono)' }} tickLine={false} axisLine={false} unit="ms" />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="avgLatency" name="Avg Latency" stroke="var(--neon-amber)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
