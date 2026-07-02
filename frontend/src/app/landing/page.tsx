'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  Shield,
  BarChart3,
  Package,
  Globe,
  Lock,
  Database,
  CheckCircle,
  ArrowRight,
  Settings,
  Cpu,
  Terminal,
  Layers,
  ChevronRight,
  Gauge
} from 'lucide-react';

/* ── Custom Geometric SVG Logo ──────────────── */
function LogoIcon({ size = 28 }: { size?: number }) {
  return (
    <img
      src="/FlowForge.png"
      alt="FlowForge Logo"
      width={size}
      height={size}
      style={{ objectFit: 'contain' }}
    />
  );
}

/* ── Animated counter hook ──────────────────── */
function useCounter(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setValue(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return value;
}

/* ── Typewriter hook ──────────────────────── */
function useTypewriter(texts: string[], speed = 60) {
  const [display, setDisplay] = useState('');
  const [idx, setIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const current = texts[idx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setDisplay(current.slice(0, charIdx + 1));
        if (charIdx + 1 === current.length) {
          setTimeout(() => setDeleting(true), 2000);
        } else setCharIdx(c => c + 1);
      } else {
        setDisplay(current.slice(0, charIdx - 1));
        if (charIdx - 1 === 0) {
          setDeleting(false);
          setIdx(i => (i + 1) % texts.length);
          setCharIdx(0);
        } else setCharIdx(c => c - 1);
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, idx, texts, speed]);
  return display;
}

/* ── High-Fidelity Product Mockup Component ──── */
function HeroProductMockup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;
    const parent = containerRef.current.parentElement;
    if (!parent) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const parentWidth = entry.contentRect.width;
        const targetWidth = 1000;
        if (parentWidth < targetWidth) {
          setScale(parentWidth / targetWidth);
        } else {
          setScale(1);
        }
      }
    });

    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  const nodes = [
    { id: '1', title: 'HTTP Trigger', desc: 'POST /api/v1/auth', icon: <Globe size={12} color="#6366f1" />, x: 25, y: 140, color: '#6366f1' },
    { id: '2', title: 'JWT Validator', desc: 'Secure Authorization', icon: <Lock size={12} color="#a5b4fc" />, x: 165, y: 50, color: '#a5b4fc' },
    { id: '3', title: 'Prisma DB CRUD', desc: 'Find unique user', icon: <Database size={12} color="#38bdf8" />, x: 305, y: 230, color: '#38bdf8' },
    { id: '4', title: 'HTTP Response', desc: '200 Success Body', icon: <CheckCircle size={12} color="#10b981" />, x: 445, y: 140, color: '#10b981' }
  ];

  const baseWidth = 1000;
  const baseHeight = 418;

  return (
    <div
      ref={containerRef}
      style={{
        marginTop: 64,
        width: '100%',
        height: baseHeight * scale,
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        transition: 'height 0.2s ease-out',
        position: 'relative',
        zIndex: 2
      }}
    >
      <div
        className="glass"
        style={{
          width: baseWidth,
          height: baseHeight,
          borderRadius: 14,
          background: 'rgba(8, 8, 8, 0.4)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.03)',
          overflow: 'hidden',
          animation: 'fadeIn 0.8s ease 0.3s both',
          textAlign: 'left',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          flexShrink: 0,
          transition: 'transform 0.2s ease-out'
        }}
      >
        {/* Title bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          height: 38,
          padding: '0 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(255, 255, 255, 0.01)'
        }}>
          <div style={{ display: 'flex', gap: 6, marginRight: 24 }}>
            {['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.2)'].map((c, i) => (
              <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />
            ))}
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 6,
            padding: '3px 16px',
            fontSize: 10,
            color: '#64748b',
            fontFamily: 'monospace',
            flex: 1,
            maxWidth: 320,
            textAlign: 'center',
            margin: '0 auto',
            letterSpacing: '0.02em'
          }}>
            flowforge.app/projects/auth-handler/canvas
          </div>
          <div style={{ width: 60 }} />
        </div>

        {/* Main app panel */}
        <div style={{ display: 'flex', height: 380, position: 'relative' }}>
          {/* Left side node library */}
          <div style={{
            width: 190,
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '16px',
            background: 'rgba(2, 2, 2, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4, fontFamily: 'monospace' }}>Node Palette</div>
            {[
              { name: 'HTTP Trigger', icon: <Globe size={11} color="var(--text-muted)" /> },
              { name: 'JWT Auth', icon: <Lock size={11} color="var(--text-muted)" /> },
              { name: 'DB Query', icon: <Database size={11} color="var(--text-muted)" /> },
              { name: 'Custom Code', icon: <Terminal size={11} color="var(--text-muted)" /> },
              { name: 'Gateway Res', icon: <CheckCircle size={11} color="var(--text-muted)" /> },
              { name: 'Cron Timer', icon: <Cpu size={11} color="var(--text-muted)" /> }
            ].map((n, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 6,
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: 11,
                color: '#94a3b8',
                cursor: 'pointer'
              }}>
                {n.icon}
                {n.name}
              </div>
            ))}
          </div>

          {/* Center node editor canvas */}
          <div style={{
            flex: 1,
            position: 'relative',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.015) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            overflow: 'hidden'
          }}>
            {/* Connection Lines */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <line x1={145} y1={165} x2={165} y2={75} stroke="#6366f1" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
              <line x1={285} y1={75} x2={305} y2={255} stroke="#a5b4fc" strokeWidth="1.5" opacity="0.6" />
              <line x1={425} y1={255} x2={445} y2={165} stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" />
            </svg>

            {/* Render Nodes */}
            {nodes.map(n => (
              <div
                key={n.id}
                className="glass"
                style={{
                  position: 'absolute',
                  left: `${n.x}px`,
                  top: `${n.y}px`,
                  width: 125,
                  padding: '10px',
                  borderRadius: 8,
                  background: 'rgba(10, 10, 10, 0.85)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                  zIndex: 10
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  {n.icon}
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#f1f5f9' }}>{n.title}</span>
                </div>
                <div style={{ fontSize: 9, color: '#64748b', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.desc}</div>
              </div>
            ))}

            {/* Canvas Zoom controls */}
            <div
              className="glass"
              style={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                display: 'flex',
                gap: 4,
                borderRadius: 6,
                padding: 3,
                background: 'rgba(10, 10, 10, 0.8)'
              }}
            >
              {['+', '−', '100%'].map((c, i) => (
                <div key={i} style={{ padding: '3px 8px', fontSize: 9, color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold' }}>{c}</div>
              ))}
            </div>
          </div>

          {/* Right side live generated code output */}
          <div style={{
            width: 250,
            borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(2, 2, 2, 0.4)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '10px 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: 9,
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontFamily: 'monospace'
            }}>Generated Fastify App</div>
            <div style={{
              padding: '16px',
              fontFamily: 'monospace',
              fontSize: 10,
              color: '#38bdf8',
              lineHeight: 1.5,
              overflowY: 'auto',
              flex: 1
            }}>
              <span style={{ color: '#64748b' }}>// Visual routing node logic</span><br />
              <span style={{ color: '#a5b4fc' }}>import</span> Fastify <span style={{ color: '#a5b4fc' }}>from</span> <span style={{ color: '#10b981' }}>'fastify'</span>;<br />
              <span style={{ color: '#a5b4fc' }}>import</span> jwt <span style={{ color: '#a5b4fc' }}>from</span> <span style={{ color: '#10b981' }}>'@fastify/jwt'</span>;<br /><br />
              fastify.post(<span style={{ color: '#10b981' }}>'/auth'</span>,<br />
              &nbsp;&nbsp;<span style={{ color: '#a5b4fc' }}>async</span> (req, res) =&gt; &#123;<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#64748b' }}>// 1. Verify credentials</span><br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#a5b4fc' }}>const</span> user = <span style={{ color: '#a5b4fc' }}>await</span> db.user.findUnique(&#123;<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;where: &#123; email: req.body.email &#125;<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&#125;);<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#a5b4fc' }}>return</span> &#123; success: true, user &#125;;<br />
              &nbsp;&nbsp;&#125;<br />
              );
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Visible Intersection Hook ────────────── */
function useVisible(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, visible] as const;
}

/* ── Bento Grid Feature Container ─────────── */
function FeatureBentoGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 24, marginTop: 54 }}>
      {/* Card 1: Visual Logic Canvas - Spans 4 Columns */}
      <div
        className="glass"
        style={{
          gridColumn: 'span 4',
          padding: '36px',
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 320,
          background: 'rgba(8,8,8,0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: 0, right: 0, width: 220, height: 220, background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <Layers size={20} color="#818cf8" />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 12, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Visual API Logic Orchestra</h3>
          <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, maxWidth: 540 }}>
            Model complex request flows, data operations, and conditional switches without code. Connect triggering HTTP nodes to database queries, custom scripts, and authentication loops instantly.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
          {['If/Else branching', 'SQL query maps', 'Port mappings', 'Custom JSON transforms'].map(tag => (
            <span key={tag} style={{ fontSize: 11, fontFamily: 'monospace', color: '#818cf8', background: 'rgba(99,102,241,0.06)', padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(99,102,241,0.12)' }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Card 2: 100% Code Export - Spans 2 Columns */}
      <div
        className="glass"
        style={{
          gridColumn: 'span 2',
          padding: '36px',
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 320,
          background: 'rgba(8,8,8,0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <Package size={20} color="#10b981" />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 12, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Zero Lock-In Export</h3>
          <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.6 }}>
            Download standard production-ready Fastify + TypeScript + Prisma modules in one click. Deploy on your own servers without platform lock-in.
          </p>
        </div>
        <div style={{ marginTop: 20 }}>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#10b981', background: 'rgba(16,185,129,0.06)', padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(16,185,129,0.12)', display: 'inline-block' }}>Compile to Fastify</span>
        </div>
      </div>

      {/* Card 3: Secure API Gateway Policies - Spans 2 Columns */}
      <div
        className="glass"
        style={{
          gridColumn: 'span 2',
          padding: '36px',
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 320,
          background: 'rgba(8,8,8,0.4)'
        }}
      >
        <div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(239,115,22,0.06)', border: '1px solid rgba(239,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <Shield size={20} color="#f97316" />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 12, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Gateway Shield</h3>
          <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.6 }}>
            Inject rate-limiting thresholds, CORS policies, JWT signature checks, and validation headers dynamically with zero middleware overhead.
          </p>
        </div>
        <div style={{ marginTop: 20 }}>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#f97316', background: 'rgba(239,115,22,0.06)', padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(239,115,22,0.12)', display: 'inline-block' }}>JWT & Rate Throttles</span>
        </div>
      </div>

      {/* Card 4: Live Telemetry & Observability - Spans 4 Columns */}
      <div
        className="glass"
        style={{
          gridColumn: 'span 4',
          padding: '36px',
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 320,
          background: 'rgba(8,8,8,0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 200, height: 120, background: 'radial-gradient(ellipse at bottom right, rgba(56,189,248,0.07) 0%, transparent 80%)', pointerEvents: 'none' }} />
        <div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <Gauge size={20} color="#38bdf8" />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 12, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Real-time Gateway Telemetry</h3>
          <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, maxWidth: 540 }}>
            Inspect connection health, latency graphs, status code rates, and network performance in real-time. Instantly trace gateway executions and watch server logs on the dashboard.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
          {['Latency tracking', 'Status distributions', 'Performance diagnostics', 'Log tracing'].map(tag => (
            <span key={tag} style={{ fontSize: 11, fontFamily: 'monospace', color: '#38bdf8', background: 'rgba(56,189,248,0.06)', padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(56,189,248,0.12)' }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Visual How It Works Steps ────────────── */
function HowItWorks() {
  const [ref, visible] = useVisible(0.15);
  return (
    <div
      ref={ref}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 32,
        position: 'relative',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {[
        { num: '01', title: 'Design Schema', desc: 'Drag and drop node logic triggers, auth blocks, and DB handlers onto the visual workspace canvas.' },
        { num: '02', title: 'Inject Guardrails', desc: 'Attach client rate-limiting, secure JWT tokens, and CORS permissions directly to your route ports.' },
        { num: '03', title: 'Compile & Run', desc: 'Initiate sandbox environment to run live routes instantly, or pull standard code for self-hosting.' },
      ].map((step, i) => (
        <div
          key={step.num}
          className="glass"
          style={{
            position: 'relative',
            zIndex: 1,
            transition: 'all 0.5s',
            transform: visible ? 'scale(1)' : 'scale(0.97)',
            opacity: visible ? 1 : 0,
            transitionDelay: `${i * 0.12}s`,
            textAlign: 'left',
            padding: '30px',
            borderRadius: 16,
            background: 'rgba(10, 10, 10, 0.3)'
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 900, fontFamily: 'monospace', color: '#6366f1', opacity: 0.8, marginBottom: 20 }}>{step.num}</div>
          <h4 style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", marginBottom: 10, color: '#f1f5f9' }}>{step.title}</h4>
          <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.6 }}>{step.desc}</p>
        </div>
      ))}
    </div>
  );
}

/* ── MAIN LANDING PAGE ──────────────────── */
export default function LandingPage() {
  const typed = useTypewriter(['Fastify APIs', 'TypeScript Logic', 'DB Connectors', 'JWT Handlers', 'Gateway Proxies'], 55);
  const [stats, setStats] = useState({ totalRequests: 0, totalWorkflows: 0, avgLatency: 0, totalProjects: 0 });
  const [loaded, setLoaded] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  // Hero counter animations
  const heroRequests = useCounter(stats.totalRequests, 2000, loaded);
  const heroApis = useCounter(stats.totalWorkflows, 1800, loaded);
  const heroLatency = useCounter(stats.avgLatency, 1500, loaded);

  // Stats banner animations
  const requests = useCounter(stats.totalRequests, 2000, statsVisible);
  const apis = useCounter(stats.totalWorkflows, 1800, statsVisible);
  const latency = useCounter(stats.avgLatency, 1500, statsVisible);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const url = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/public-stats';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success') {
            setStats({
              totalRequests: data.totalRequests || 0,
              totalWorkflows: data.totalWorkflows || 0,
              avgLatency: data.avgLatency || 0,
              totalProjects: data.totalProjects || 0,
            });
            setLoaded(true);
          }
        }
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };
    fetchStats();

    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#000000', color: '#f1f5f9', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────── */}
      <nav
        className="glass"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          padding: '0 40px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(2, 2, 2, 0.75)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LogoIcon />
          <span style={{ fontSize: 17, fontWeight: 900, letterSpacing: '-0.3px', fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
            Flow<span style={{ background: 'linear-gradient(135deg, #6366f1, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Forge</span>
          </span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/login"
            style={{
              padding: '7px 20px',
              borderRadius: 100,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'transparent',
              color: '#94a3b8',
              fontSize: 12,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s',
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}
            onMouseEnter={e => { (e.currentTarget as any).style.borderColor = 'rgba(255, 255, 255, 0.2)'; (e.currentTarget as any).style.color = '#f1f5f9'; }}
            onMouseLeave={e => { (e.currentTarget as any).style.borderColor = 'rgba(255, 255, 255, 0.08)'; (e.currentTarget as any).style.color = '#94a3b8'; }}>
            Sign in
          </Link>
          <Link href="/register"
            style={{
              padding: '7px 22px',
              borderRadius: 100,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(99,102,241,0.2)',
              transition: 'all 0.2s',
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}
            onMouseEnter={e => { (e.currentTarget as any).style.transform = 'translateY(-1px)'; (e.currentTarget as any).style.boxShadow = '0 6px 20px rgba(99,102,241,0.3)'; }}
            onMouseLeave={e => { (e.currentTarget as any).style.transform = 'translateY(0)'; (e.currentTarget as any).style.boxShadow = '0 4px 14px rgba(99,102,241,0.2)'; }}>
            Get started free
          </Link>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', paddingTop: 100, paddingBottom: 60 }}>
        {/* Floating gradient circles */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '20%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.08)',
          filter: 'blur(90px)',
          animation: 'float 9s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: 450,
          height: 450,
          borderRadius: '50%',
          background: 'rgba(139, 92, 246, 0.07)',
          filter: 'blur(100px)',
          animation: 'floatSlow 12s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        {/* Dotted grid pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.015) 1px, transparent 0)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse at center, black, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 75%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', width: '100%', maxWidth: 1000, padding: '0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 100, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: 28, animation: 'fadeIn 0.6s ease 0.1s both' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#05ffc4', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.02em', fontFamily: 'monospace' }}>⚡ Visual No-Code API Assembly & Compiler</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.1, letterSpacing: '-2px', marginBottom: 14, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", animation: 'fadeIn 0.7s ease 0.2s both' }}>
            Architect, Compile & Run
            <span style={{ background: 'linear-gradient(135deg, #818cf8 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'block', margin: '4px 0' }}>
              {typed}
            </span>
            Without Vendor Lock-In.
          </h1>

          <p style={{ fontSize: 17, color: '#94a3b8', marginBottom: 40, lineHeight: 1.6, maxWidth: 640, margin: '16px auto 36px', animation: 'fadeIn 0.7s ease 0.35s both', fontWeight: 400 }}>
            FlowForge builds backend logic visual graphs and compiles them to standard TypeScript. Self-host standard Fastify routes anywhere, or run instantly on our high-performance sandbox gateway.
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeIn 0.7s ease 0.5s both', marginBottom: 36 }}>
            <Link href="/register" style={{
              padding: '12px 30px', borderRadius: 100, border: 'none',
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff',
              fontSize: 14, fontWeight: 650, textDecoration: 'none',
              boxShadow: '0 4px 18px rgba(99,102,241,0.25)',
              transition: 'all 0.2s',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
              onMouseEnter={e => { (e.currentTarget as any).style.transform = 'translateY(-1px)'; (e.currentTarget as any).style.boxShadow = '0 6px 20px rgba(99,102,241,0.35)'; }}
              onMouseLeave={e => { (e.currentTarget as any).style.transform = 'translateY(0)'; (e.currentTarget as any).style.boxShadow = '0 4px 14px rgba(99,102,241,0.25)'; }}>
              Start Building Free <Zap size={13} fill="#fff" />
            </Link>
            <Link href="/login"
              style={{
                padding: '12px 28px',
                borderRadius: 100,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(255,255,255,0.01)',
                color: '#f1f5f9',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: "'Plus Jakarta Sans', sans-serif"
              }}
              onMouseEnter={e => { (e.currentTarget as any).style.borderColor = 'rgba(255, 255, 255, 0.2)'; (e.currentTarget as any).style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { (e.currentTarget as any).style.borderColor = 'rgba(255, 255, 255, 0.08)'; (e.currentTarget as any).style.background = 'rgba(255,255,255,0.01)'; }}>
              Explore Console <ArrowRight size={13} />
            </Link>
          </div>

          {/* Social proof / stats inline */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36, animation: 'fadeIn 0.7s ease 0.6s both', flexWrap: 'wrap' }}>
            {[
              { val: heroApis.toLocaleString() + '+', label: 'APIs Generated' },
              { val: heroRequests > 1000000 ? `${(heroRequests / 1000000).toFixed(1)}M+` : heroRequests.toLocaleString() + '+', label: 'Total Executions' },
              { val: heroLatency > 0 ? `<${heroLatency}ms` : '0ms', label: 'Average Overhead' }
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', fontFamily: 'monospace' }}>{s.val}</span>
                <span style={{ fontSize: 12, color: '#64748b' }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* CSS Product Mockup */}
          <HeroProductMockup />
        </div>
      </section>

      {/* ── STATS BANNER ───────────────────────────────────────────── */}
      <div
        ref={statsRef}
        style={{
          padding: '48px 40px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(8, 8, 8, 0.4)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40, textAlign: 'center' }}>
          {[
            { value: requests > 1000000 ? `${(requests / 1000000).toFixed(1)}M+` : requests.toLocaleString(), label: 'Network Operations Compiled', color: '#818cf8' },
            { value: apis.toLocaleString() + '+', label: 'Fastify Runtimes Deployed', color: '#10b981' },
            { value: latency + 'ms', label: 'Avg Router Overhead', color: '#38bdf8' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 36, fontWeight: 900, color: s.color, letterSpacing: '-1.5px', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 8, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BENTO GRID FEATURES ───────────────────────────────────── */}
      <section style={{ padding: '96px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12, fontFamily: 'monospace' }}>Full Architectural Control</div>
            <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1px', fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
              Enterprise Orchestration, Zero Complexity
            </h2>
          </div>
          <FeatureBentoGrid />
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────── */}
      <section style={{ padding: '80px 40px 96px', background: 'rgba(4, 4, 4, 0.4)', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12, fontFamily: 'monospace' }}>Visual Compile Pipeline</div>
          <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1px', fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", marginBottom: 54 }}>
            Visual Assembly in 3 Steps
          </h2>
          <HowItWorks />
        </div>
      </section>

      {/* ── CTA FOOTER ─────────────────────────────────────────────── */}
      <section style={{ padding: '100px 40px', position: 'relative', overflow: 'hidden', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-1px', fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", marginBottom: 16, lineHeight: 1.15 }}>
            Ready to compile fast, robust APIs?
          </div>
          <p style={{ fontSize: 16, color: '#94a3b8', marginBottom: 36, lineHeight: 1.6, fontWeight: 300 }}>
            Join developers building custom, production-ready, zero-lockin backends. Free sandbox tier, no credit card required.
          </p>
          <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 36px', borderRadius: 100, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 14, fontWeight: 650, textDecoration: 'none', boxShadow: '0 4px 18px rgba(99,102,241,0.25)', transition: 'all 0.2s', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            onMouseEnter={e => { (e.currentTarget as any).style.transform = 'translateY(-1px)'; (e.currentTarget as any).style.boxShadow = '0 6px 20px rgba(99,102,241,0.35)'; }}
            onMouseLeave={e => { (e.currentTarget as any).style.transform = 'translateY(0)'; (e.currentTarget as any).style.boxShadow = '0 4px 14px rgba(99,102,241,0.25)'; }}>
            Assemble First Endpoint <Zap size={14} fill="#fff" />
          </Link>
          <div style={{ marginTop: 18, fontSize: 12, color: '#475569', fontFamily: 'monospace' }}>⚡ Complete code output · Docker setup generated · SQLite/PosgreSQL ready</div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer style={{ padding: '32px 40px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, background: '#000000' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LogoIcon size={22} />
          <span style={{ fontSize: 14, fontWeight: 800, color: '#94a3b8', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>FlowForge</span>
        </div>
        <div style={{ fontSize: 12, color: '#475569' }}>
          Built with ⚡ by the FlowForge team · {new Date().getFullYear()}
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {['Privacy', 'Terms', 'Docs'].map(l => <a key={l} href="#" style={{ fontSize: 12, color: '#475569', textDecoration: 'none', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'} onMouseLeave={e => e.currentTarget.style.color = '#475569'}>{l}</a>)}
        </div>
      </footer>
    </div>
  );
}
