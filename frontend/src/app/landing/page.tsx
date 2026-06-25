'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

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
          setTimeout(() => setDeleting(true), 1800);
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

/* ── Star field canvas ───────────────────── */
function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.2,
      alpha: Math.random(),
      speed: Math.random() * 0.004 + 0.001,
      phase: Math.random() * Math.PI * 2,
    }));
    let frame: number;
    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        s.alpha = 0.3 + 0.7 * Math.abs(Math.sin(t * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(165, 180, 252, ${s.alpha})`;
        ctx.fill();
      });
      t++;
      frame = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', onResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.7 }} />;
}

/* ── Flowing connection lines SVG ─────────── */
function FlowLines() {
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.18, pointerEvents: 'none' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lineGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
          <stop offset="50%" stopColor="#6366f1" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </linearGradient>
        <filter id="blur1"><feGaussianBlur stdDeviation="1" /></filter>
      </defs>
      {/* Horizontal flowing lines */}
      {[15, 30, 45, 55, 70, 85].map((y, i) => (
        <line key={i} x1="0" y1={`${y}%`} x2="100%" y2={`${y + (i % 2 === 0 ? 5 : -3)}%`}
          stroke="url(#lineGrad1)" strokeWidth="0.5" filter="url(#blur1)">
          <animate attributeName="opacity" values="0.2;0.7;0.2" dur={`${4 + i}s`} repeatCount="indefinite" begin={`${i * 0.7}s`} />
        </line>
      ))}
      {/* Diagonal accent lines */}
      <line x1="20%" y1="0" x2="80%" y2="100%" stroke="url(#lineGrad2)" strokeWidth="0.3">
        <animate attributeName="opacity" values="0;0.6;0" dur="8s" repeatCount="indefinite" />
      </line>
      <line x1="80%" y1="0" x2="20%" y2="100%" stroke="url(#lineGrad2)" strokeWidth="0.3">
        <animate attributeName="opacity" values="0;0.4;0" dur="10s" repeatCount="indefinite" begin="4s" />
      </line>
    </svg>
  );
}

/* ── Animated Workflow Preview Card ─────── */
function WorkflowPreview() {
  const nodes = [
    { label: 'POST /users', color: '#6366f1', x: 40, y: 80, icon: '🌐' },
    { label: 'JWT Validate', color: '#ef4444', x: 200, y: 40, icon: '🔐' },
    { label: 'DB Query', color: '#38bdf8', x: 360, y: 80, icon: '🗄️' },
    { label: 'Transform', color: '#ec4899', x: 200, y: 140, icon: '🔄' },
    { label: '200 OK', color: '#10b981', x: 480, y: 80, icon: '📤' },
  ];
  const edges = [
    { x1: 120, y1: 100, x2: 200, y2: 60, id: 'e1' },
    { x1: 200, y1: 60, x2: 360, y2: 100, id: 'e2' },
    { x1: 120, y1: 100, x2: 200, y2: 160, id: 'e3' },
    { x1: 200, y1: 160, x2: 360, y2: 100, id: 'e4' },
    { x1: 440, y1: 100, x2: 480, y2: 100, id: 'e5' },
  ];
  return (
    <div style={{ position: 'relative', width: '100%', height: 220, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16, overflow: 'hidden', backdropFilter: 'blur(12px)' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#6366f1" opacity="0.6" />
          </marker>
        </defs>
        {edges.map(e => (
          <line key={e.id} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
            stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" markerEnd="url(#arrow)">
            <animate attributeName="stroke-dashoffset" from="7" to="0" dur="1s" repeatCount="indefinite" />
          </line>
        ))}
        {nodes.map((n, i) => (
          <g key={n.label}>
            <rect x={n.x - 10} y={n.y - 22} width={80} height={34} rx="8" fill={n.color + '18'} stroke={n.color + '50'} strokeWidth="1">
              <animate attributeName="opacity" values="0.7;1;0.7" dur={`${2.5 + i * 0.4}s`} repeatCount="indefinite" begin={`${i * 0.3}s`} />
            </rect>
            <text x={n.x + 30} y={n.y - 2} textAnchor="middle" fill={n.color} fontSize="9" fontFamily="Inter, sans-serif" fontWeight="700">{n.icon} {n.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ── Animated Code Snippet ──────────────── */
function CodeSnippet() {
  const lines = [
    { text: '// FlowForge AI-generated API', color: '#475569' },
    { text: 'const workflow = await forge.create({', color: '#94a3b8' },
    { text: "  name: 'User Auth API',", color: '#c084fc' },
    { text: "  method: 'POST', path: '/auth',", color: '#818cf8' },
    { text: '  nodes: [jwtNode, dbNode, res],', color: '#7dd3fc' },
    { text: '});', color: '#94a3b8' },
    { text: 'await workflow.publish(); // 🚀', color: '#34d399' },
  ];
  const [visible, setVisible] = useState<number[]>([]);
  useEffect(() => {
    lines.forEach((_, i) => {
      setTimeout(() => setVisible(v => [...v, i]), 200 + i * 280);
    });
  }, []);
  return (
    <div style={{ background: 'rgba(2,6,23,0.9)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 14, overflow: 'hidden', fontFamily: 'JetBrains Mono, monospace' }}>
      {/* Window chrome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15,23,42,0.6)' }}>
        {['#ef4444', '#f59e0b', '#10b981'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
        <span style={{ marginLeft: 8, fontSize: 10, color: '#334155' }}>workflow.ts</span>
      </div>
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {lines.map((l, i) => (
          <div key={i} style={{ fontSize: 12, color: l.color, opacity: visible.includes(i) ? 1 : 0, transform: visible.includes(i) ? 'translateX(0)' : 'translateX(-10px)', transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#1e293b', minWidth: 16, fontSize: 10 }}>{i + 1}</span>
            <span>{l.text}{i === lines.length - 1 && visible.includes(i) && <span style={{ animation: 'blink 1s step-end infinite', borderRight: '2px solid #6366f1', marginLeft: 1 }}>&nbsp;</span>}</span>
          </div>
        ))}
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

/* ── Individual Feature Pod Capsule ───────── */
function FeaturePod({ f, i }: { f: any; i: number }) {
  const [ref, visible] = useVisible(0.15);
  const isLeft = f.align === 'left';
  
  return (
    <div ref={ref} style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: isLeft ? 'flex-start' : 'flex-end',
      position: 'relative',
      width: '100%',
      minHeight: 120,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {/* Central connection branch line */}
      <div style={{
        position: 'absolute',
        left: '50%',
        width: '35%',
        height: 1,
        borderTop: '1px dashed rgba(255,255,255,0.15)',
        transform: isLeft ? 'translateX(-100%)' : 'none',
        zIndex: 0,
        pointerEvents: 'none'
      }}>
        <div style={{
          position: 'absolute',
          top: -2,
          right: isLeft ? 0 : 'auto',
          left: isLeft ? 'auto' : 0,
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: f.color,
          boxShadow: `0 0 10px ${f.color}`
        }} />
      </div>

      {/* Reactor Node Capsule */}
      <div 
        style={{
          width: '42%',
          background: 'rgba(10,15,30,0.65)',
          border: `1.5px solid rgba(99,102,241,0.12)`,
          borderRadius: 24,
          padding: '24px 28px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35), inset 0 0 15px rgba(99,102,241,0.05)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          zIndex: 2,
          transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
          display: 'flex',
          gap: 16,
          alignItems: 'flex-start'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = f.color + '60';
          e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.45), 0 0 25px ${f.color}25, inset 0 0 20px ${f.color}15`;
          e.currentTarget.style.transform = isLeft ? 'translateX(-6px) scale(1.01)' : 'translateX(6px) scale(1.01)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(99,102,241,0.12)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.35), inset 0 0 15px rgba(99,102,241,0.05)';
          e.currentTarget.style.transform = 'none';
        }}
      >
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: f.color + '15',
          border: `1px solid ${f.color}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          flexShrink: 0,
          boxShadow: `0 0 12px ${f.color}20`,
          animation: 'float 3s ease-in-out infinite'
        }}>{f.icon}</div>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', marginBottom: 8, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>{f.title}</h3>
          <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{f.desc}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Complete Feature Pipeline Reactor ────── */
function FeaturePipeline() {
  const features = [
    { icon: '⚡', title: 'Visual API Builder', desc: 'Drag-and-drop 10+ node types onto a canvas to build complete backend workflows — no code needed.', color: '#818cf8', align: 'left' },
    { icon: '✨', title: 'AI Workflow Generator', desc: 'Describe your API in plain English. Gemini AI instantly generates the complete workflow graph.', color: '#c084fc', align: 'right' },
    { icon: '🛡️', title: 'Enterprise Gateway', desc: 'JWT auth, API key validation, rate limiting, CORS and real-time metrics — all built-in per endpoint.', color: '#f97316', align: 'left' },
    { icon: '📊', title: 'Live Analytics', desc: 'Beautiful real-time dashboards with traffic trends, latency heatmaps, and top-route breakdowns.', color: '#38bdf8', align: 'right' },
    { icon: '📦', title: 'Code Export', desc: 'Generate production-ready Fastify + TypeScript + Prisma code. Export as ZIP or push to GitHub.', color: '#10b981', align: 'left' },
    { icon: '🔗', title: 'Service Mesh', desc: 'Visualize and manage inter-service communication with an interactive graph and health monitoring.', color: '#ec4899', align: 'right' },
  ];

  return (
    <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto', padding: '40px 0' }}>
      {/* Central animated SVG pipeline track */}
      <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: 'rgba(99,102,241,0.15)', transform: 'translateX(-50%)', zIndex: 0 }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(180deg, transparent, #6366f1, #8b5cf6, #ec4899, #10b981, transparent)',
          animation: 'shimmer 3s infinite linear',
          backgroundSize: '100% 200%'
        }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 64, position: 'relative', zIndex: 1 }}>
        {features.map((f, i) => (
          <FeaturePod key={i} f={f} i={i} />
        ))}
      </div>
    </div>
  );
}

/* ── Visual How It Works Steps ────────────── */
function HowItWorks() {
  const [ref, visible] = useVisible(0.15);
  return (
    <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32, position: 'relative', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      {/* Connector line */}
      <div style={{ position: 'absolute', top: 28, left: '20%', right: '20%', height: 1, background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1)', animation: 'pulseGlow 3s infinite', zIndex: 0 }} />
      {[
        { num: '01', icon: '🎨', title: 'Design', desc: 'Drag node types onto the canvas. Connect them to define your API logic flow.' },
        { num: '02', icon: '✨', title: 'Configure', desc: 'Set up auth, rate limits, CORS and data transformations with a simple UI.' },
        { num: '03', icon: '🚀', title: 'Deploy', desc: 'Hit Publish. Your API is live instantly with a real HTTP endpoint.' },
      ].map((step, i) => (
        <div key={step.num} style={{ position: 'relative', zIndex: 1, transition: 'all 0.5s', transform: visible ? 'scale(1)' : 'scale(0.9)', opacity: visible ? 1 : 0, transitionDelay: `${i * 0.15}s` }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 20px', boxShadow: '0 0 30px rgba(99,102,241,0.4)', border: '3px solid rgba(99,102,241,0.2)' }}>
            {step.icon}
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#6366f1', letterSpacing: '0.1em', marginBottom: 8 }}>{step.num}</div>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", marginBottom: 10 }}>{step.title}</div>
          <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{step.desc}</div>
        </div>
      ))}
    </div>
  );
}

/* ── MAIN LANDING PAGE ──────────────────── */
export default function LandingPage() {
  const typed = useTypewriter(['Backend APIs', 'REST Endpoints', 'Microservices', 'Webhooks', 'Auth Systems'], 55);
  const [stats, setStats] = useState({ totalRequests: 0, totalWorkflows: 0, avgLatency: 0, totalProjects: 0 });
  const [loaded, setLoaded] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  // Hero counter animations (start immediately on load/fetch)
  const heroRequests = useCounter(stats.totalRequests, 2000, loaded);
  const heroApis = useCounter(stats.totalWorkflows, 1800, loaded);
  const heroLatency = useCounter(stats.avgLatency, 1500, loaded);

  // Stats banner animations (start when scrolled into view)
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

  // Mouse parallax for hero
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => setMouse({ x: (e.clientX / window.innerWidth - 0.5) * 20, y: (e.clientY / window.innerHeight - 0.5) * 20 });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const FEATURES = [
    { icon: '⚡', title: 'Visual API Builder', desc: 'Drag-and-drop 10+ node types onto a canvas to build complete backend workflows — no code needed.', color: '#818cf8', delay: 0.1 },
    { icon: '✨', title: 'AI Workflow Generator', desc: 'Describe your API in plain English. Gemini AI instantly generates the complete workflow graph.', color: '#c084fc', delay: 0.2 },
    { icon: '🛡️', title: 'Enterprise Gateway', desc: 'JWT auth, API key validation, rate limiting, CORS and real-time metrics — all built-in per endpoint.', color: '#f97316', delay: 0.3 },
    { icon: '📊', title: 'Live Analytics', desc: 'Beautiful real-time dashboards with traffic trends, latency heatmaps, and top-route breakdowns.', color: '#38bdf8', delay: 0.4 },
    { icon: '📦', title: 'Code Export', desc: 'Generate production-ready Fastify + TypeScript + Prisma code. Export as ZIP or push to GitHub.', color: '#10b981', delay: 0.5 },
    { icon: '🔗', title: 'Service Mesh', desc: 'Visualize and manage inter-service communication with an interactive graph and health monitoring.', color: '#ec4899', delay: 0.6 },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#010409', color: '#f1f5f9', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', background: 'rgba(1,4,9,0.85)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 4px 16px rgba(99,102,241,0.5)', animation: 'float 4s ease-in-out infinite' }}>⚡</div>
          <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.5px', fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>Flow<span style={{ background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Forge</span></span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/login" style={{ padding: '8px 18px', borderRadius: 9, border: '1px solid rgba(99,102,241,0.25)', background: 'transparent', color: '#94a3b8', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as any).style.borderColor = 'rgba(99,102,241,0.5)'; (e.currentTarget as any).style.color = '#f1f5f9'; }}
            onMouseLeave={e => { (e.currentTarget as any).style.borderColor = 'rgba(99,102,241,0.25)'; (e.currentTarget as any).style.color = '#94a3b8'; }}>
            Sign in
          </Link>
          <Link href="/register" style={{ padding: '8px 20px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 20px rgba(99,102,241,0.4)', transition: 'all 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as any).style.transform = 'translateY(-1px)'; (e.currentTarget as any).style.boxShadow = '0 8px 28px rgba(99,102,241,0.5)'; }}
            onMouseLeave={e => { (e.currentTarget as any).style.transform = 'translateY(0)'; (e.currentTarget as any).style.boxShadow = '0 4px 20px rgba(99,102,241,0.4)'; }}>
            Get started free →
          </Link>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', paddingTop: 64 }}>
        <StarField />
        <FlowLines />

        {/* Massive orb gradient */}
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 600, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.12) 40%, transparent 70%)', filter: 'blur(40px)', animation: 'pulse 6s ease-in-out infinite', pointerEvents: 'none' }} />

        {/* Rotating ring */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, borderRadius: '50%', border: '1px solid rgba(99,102,241,0.08)', animation: 'spin 60s linear infinite', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: -4, left: '50%', width: 8, height: 8, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 12px #6366f1', transform: 'translateX(-50%)' }} />
        </div>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', border: '1px solid rgba(139,92,246,0.06)', animation: 'spinReverse 45s linear infinite', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', bottom: -4, left: '50%', width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6', boxShadow: '0 0 10px #8b5cf6', transform: 'translateX(-50%)' }} />
        </div>

        {/* Floating node cards */}
        <div style={{ position: 'absolute', left: '8%', top: '28%', animation: 'floatSlow 8s ease-in-out infinite', opacity: 0.85, transform: `translate(${mouse.x * 0.3}px, ${mouse.y * 0.2}px)`, pointerEvents: 'none' }}>
          <div style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, padding: '10px 14px', backdropFilter: 'blur(12px)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#818cf8' }}>🌐 HTTP Trigger</div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>POST /api/users</div>
          </div>
        </div>
        <div style={{ position: 'absolute', right: '6%', top: '32%', animation: 'floatSlow 10s ease-in-out infinite 2s', opacity: 0.8, transform: `translate(${-mouse.x * 0.2}px, ${mouse.y * 0.3}px)`, pointerEvents: 'none' }}>
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 12, padding: '10px 14px', backdropFilter: 'blur(12px)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#34d399' }}>📤 Response</div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>Status: <span style={{ color: '#34d399' }}>200 OK</span></div>
          </div>
        </div>
        <div style={{ position: 'absolute', right: '12%', bottom: '30%', animation: 'floatSlow 7s ease-in-out infinite 1s', opacity: 0.75, transform: `translate(${-mouse.x * 0.15}px, ${-mouse.y * 0.2}px)`, pointerEvents: 'none' }}>
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '10px 14px', backdropFilter: 'blur(12px)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#f87171' }}>🔐 JWT Validate</div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>✓ Bearer token valid</div>
          </div>
        </div>
        <div style={{ position: 'absolute', left: '10%', bottom: '28%', animation: 'floatSlow 9s ease-in-out infinite 3s', opacity: 0.75, transform: `translate(${mouse.x * 0.25}px, ${-mouse.y * 0.15}px)`, pointerEvents: 'none' }}>
          <div style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: 12, padding: '10px 14px', backdropFilter: 'blur(12px)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8' }}>🗄️ Database</div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>SELECT * FROM users</div>
          </div>
        </div>

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 820, padding: '0 24px' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 'var(--r-full)', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', marginBottom: 28, animation: 'fadeIn 0.6s ease 0.1s both' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'pulseGlow 2s infinite', display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Now with Gemini AI Workflow Generator</span>
            <span style={{ fontSize: 12, color: '#6366f1', fontWeight: 700 }}>→ Try it</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 72, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-2px', marginBottom: 10, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", animation: 'fadeIn 0.7s ease 0.2s both' }}>
            Build
            <span style={{ background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'block', backgroundSize: '200%', animation: 'textGradient 4s linear infinite' }}>
              {typed}<span style={{ animation: 'blink 1s step-end infinite', WebkitTextFillColor: '#818cf8', borderRight: '3px solid #818cf8' }}>&nbsp;</span>
            </span>
            <span style={{ fontSize: 68 }}>Visually.</span>
          </h1>

          <p style={{ fontSize: 19, color: '#64748b', marginBottom: 40, lineHeight: 1.65, maxWidth: 600, margin: '20px auto 40px', animation: 'fadeIn 0.7s ease 0.35s both' }}>
            FlowForge is a no-code API platform where you drag, drop, connect nodes — and your backend is <span style={{ color: '#94a3b8', fontWeight: 600 }}>live in seconds</span>. Ship APIs without writing a single line of code.
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeIn 0.7s ease 0.5s both' }}>
            <Link href="/register" style={{
              padding: '15px 34px', borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff',
              fontSize: 15, fontWeight: 800, textDecoration: 'none',
              boxShadow: '0 6px 30px rgba(99,102,241,0.5)',
              transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
            }}
              onMouseEnter={e => { (e.currentTarget as any).style.transform = 'translateY(-3px) scale(1.02)'; (e.currentTarget as any).style.boxShadow = '0 12px 40px rgba(99,102,241,0.6)'; }}
              onMouseLeave={e => { (e.currentTarget as any).style.transform = 'translateY(0) scale(1)'; (e.currentTarget as any).style.boxShadow = '0 6px 30px rgba(99,102,241,0.5)'; }}>
              Start Building Free <span style={{ fontSize: 18 }}>⚡</span>
            </Link>
            <Link href="/login" style={{ padding: '15px 30px', borderRadius: 14, border: '1px solid rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.06)', color: '#94a3b8', fontSize: 15, fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              onMouseEnter={e => { (e.currentTarget as any).style.borderColor = 'rgba(99,102,241,0.5)'; (e.currentTarget as any).style.color = '#f1f5f9'; (e.currentTarget as any).style.background = 'rgba(99,102,241,0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as any).style.borderColor = 'rgba(99,102,241,0.25)'; (e.currentTarget as any).style.color = '#94a3b8'; (e.currentTarget as any).style.background = 'rgba(99,102,241,0.06)'; }}>
              Sign in →
            </Link>
          </div>

          {/* Social proof */}
          <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, animation: 'fadeIn 0.7s ease 0.7s both', flexWrap: 'wrap' }}>
            {[
              { val: heroApis.toLocaleString() + '+', label: 'APIs Built' },
              { val: heroRequests > 1000000 ? `${(heroRequests / 1000000).toFixed(1)}M+` : heroRequests.toLocaleString() + '+', label: 'Requests' },
              { val: heroLatency > 0 ? `<${heroLatency}ms` : '0ms', label: 'Gateway Latency' }
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9', fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>{s.val}</div>
                <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, animation: 'float 2s ease-in-out infinite', opacity: 0.5, zIndex: 10 }}>
          <span style={{ fontSize: 11, color: '#334155', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Scroll</span>
          <div style={{ width: 1, height: 32, background: 'linear-gradient(180deg, #6366f1, transparent)' }} />
        </div>
      </section>

      {/* ── PRODUCT PREVIEW ────────────────────────────────────────── */}
      <section style={{ padding: '100px 40px', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 14 }}>The Platform</div>
            <h2 style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-1px', fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
              Your API, built<br />
              <span style={{ background: 'linear-gradient(135deg,#818cf8,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>in minutes</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
            <div style={{ animation: 'slideInLeft 0.6s ease 0.2s both' }}>
              <div style={{ marginBottom: 16, fontSize: 13, fontWeight: 700, color: '#818cf8', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8', animation: 'pulse 2s infinite' }} />
                Live workflow canvas
              </div>
              <WorkflowPreview />
            </div>
            <div style={{ animation: 'slideInRight 0.6s ease 0.3s both' }}>
              <div style={{ marginBottom: 16, fontSize: 13, fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', animation: 'pulse 2s infinite 0.5s' }} />
                AI-generated code
              </div>
              <CodeSnippet />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BANNER ───────────────────────────────────────────── */}
      <div ref={statsRef} style={{ padding: '60px 40px', borderTop: '1px solid rgba(99,102,241,0.1)', borderBottom: '1px solid rgba(99,102,241,0.1)', background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40, textAlign: 'center' }}>
          {[
            { value: requests > 1000000 ? `${(requests / 1000000).toFixed(1)}M+` : requests.toLocaleString(), label: 'Requests Handled', color: '#818cf8', suffix: '' },
            { value: apis.toLocaleString() + '+', label: 'APIs Deployed', color: '#34d399', suffix: '' },
            { value: latency + 'ms', label: 'Avg Gateway Latency', color: '#38bdf8', suffix: '' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 48, fontWeight: 900, color: s.color, letterSpacing: '-2px', fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", lineHeight: 1, textShadow: `0 0 30px ${s.color}50` }}>{s.value}</div>
              <div style={{ fontSize: 14, color: '#475569', marginTop: 8, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ───────────────────────────────────────────────── */}
      <section style={{ padding: '100px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 14 }}>Everything you need</div>
            <h2 style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-1px', fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
              Enterprise features,<br />
              <span style={{ background: 'linear-gradient(135deg,#a5b4fc,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>zero complexity</span>
            </h2>
          </div>
          <FeaturePipeline />
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────── */}
      <section style={{ padding: '80px 40px 100px', background: 'rgba(15,23,42,0.3)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 14 }}>How it works</div>
          <h2 style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-1px', fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", marginBottom: 60 }}>
            Ship your API in<br />
            <span style={{ background: 'linear-gradient(135deg,#fb923c,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>3 simple steps</span>
          </h2>
          <HowItWorks />
        </div>
      </section>

      {/* ── CTA FOOTER ─────────────────────────────────────────────── */}
      <section style={{ padding: '100px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none', animation: 'pulse 6s ease-in-out infinite' }} />
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 56, fontWeight: 900, letterSpacing: '-1.5px', fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", marginBottom: 20, lineHeight: 1.1 }}>
            Ready to ship<br />
            <span style={{ background: 'linear-gradient(135deg,#818cf8,#c084fc,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200%', animation: 'textGradient 4s linear infinite' }}>faster than ever?</span>
          </div>
          <p style={{ fontSize: 17, color: '#64748b', marginBottom: 40, lineHeight: 1.6 }}>
            Join thousands of teams building APIs visually with FlowForge.<br />Free forever. No credit card required.
          </p>
          <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '17px 40px', borderRadius: 16, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 17, fontWeight: 800, textDecoration: 'none', boxShadow: '0 8px 40px rgba(99,102,241,0.5)', transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)', fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}
            onMouseEnter={e => { (e.currentTarget as any).style.transform = 'translateY(-3px) scale(1.03)'; (e.currentTarget as any).style.boxShadow = '0 16px 50px rgba(99,102,241,0.6)'; }}
            onMouseLeave={e => { (e.currentTarget as any).style.transform = 'translateY(0) scale(1)'; (e.currentTarget as any).style.boxShadow = '0 8px 40px rgba(99,102,241,0.5)'; }}>
            Start Building for Free <span style={{ fontSize: 22 }}>⚡</span>
          </Link>
          <div style={{ marginTop: 18, fontSize: 13, color: '#334155' }}>No credit card required · Deploy in seconds · Always free tier</div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer style={{ padding: '32px 40px', borderTop: '1px solid rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 7, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>⚡</div>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#475569', fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>FlowForge</span>
        </div>
        <div style={{ fontSize: 12, color: '#334155' }}>
          Built with ⚡ by the FlowForge team · {new Date().getFullYear()}
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {['Privacy', 'Terms', 'Docs'].map(l => <a key={l} href="#" style={{ fontSize: 12, color: '#334155', textDecoration: 'none', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = '#64748b'} onMouseLeave={e => e.currentTarget.style.color = '#334155'}>{l}</a>)}
        </div>
      </footer>
    </div>
  );
}
