'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../services/api';

const PROJECT_ICONS = ['📦', '🔌', '⚙️', '🛠️', '🚀', '🌐', '🔗', '💡', '🎯', '🔮'];
const PROJECT_GRADIENTS = [
  'linear-gradient(135deg, #6366f1 0%, #a5b4fc 100%)',
  'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
  'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)',
  'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%)',
];

function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) { setCount(0); return; }
    
    const totalSteps = 40;
    const stepTime = duration / totalSteps;
    let step = 0;
    
    const timer = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      const currentCount = Math.round(end * progress);
      setCount(currentCount);
      
      if (step >= totalSteps) {
        setCount(end);
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}</span>;
}

function DashboardHud({ projects, totalWorkflows, publishedCount }: any) {
  return (
    <div className="cyber-plate-cyan tech-corners" style={{
      padding: '24px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 24,
      flexWrap: 'wrap',
      marginBottom: 44,
      animation: 'fadeIn 0.5s ease both'
    }}>
      {[
        { icon: '📁', label: 'Projects Deployed', value: projects.length, color: '#00f2fe' },
        { icon: '⚙️', label: 'Total Workflows', value: totalWorkflows, color: '#f355da' },
        { icon: '🚀', label: 'Live APIs', value: publishedCount, sub: 'Running in sandbox', color: '#05ffc4' },
        { icon: '📡', label: 'Gateway Status', value: 'ONLINE', isStatus: true, color: '#38bdf8' }
      ].map((stat, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 160, position: 'relative' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${stat.color}15`, border: `1px solid ${stat.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: `0 0 15px ${stat.color}18`, animation: 'float 3s ease-in-out infinite' }}>
            {stat.icon}
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--mono)' }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: stat.isStatus ? stat.color : 'var(--text-primary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--mono)' }}>
              {stat.isStatus ? stat.value : <AnimatedCounter value={stat.value} />}
              {stat.isStatus && <span style={{ width: 7, height: 7, borderRadius: '50%', background: stat.color, boxShadow: `0 0 10px ${stat.color}`, animation: 'pulseGlow 2.5s infinite' }} />}
            </div>
            {stat.sub && <div style={{ fontSize: 9, color: 'var(--text-faint)', marginTop: 2, fontFamily: 'var(--mono)' }}>{stat.sub}</div>}
          </div>
          {i < 3 && <div style={{ position: 'absolute', right: -12, top: '10%', bottom: '10%', width: 1, background: 'linear-gradient(180deg, transparent, rgba(0, 242, 254, 0.1), transparent)' }} />}
        </div>
      ))}
    </div>
  );
}

function ConnectionWeb() {
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, opacity: 0.25 }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(99,102,241,0.12)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      
      {/* Center glowing nebula */}
      <circle cx="50%" cy="50%" r="300" fill="url(#centerGlow)" />
      
      {/* Core dynamic axes */}
      <line x1="0" y1="50%" x2="100%" y2="50%" stroke="url(#glowGrad)" strokeWidth="0.8" strokeDasharray="6 8" />
      <line x1="50%" y1="0" x2="50%" y2="100%" stroke="url(#glowGrad)" strokeWidth="0.8" strokeDasharray="6 8" />

      {/* Dynamic rotating coordinate rings */}
      <circle cx="50%" cy="50%" r="120" fill="none" stroke="url(#glowGrad)" strokeWidth="0.8" strokeDasharray="5 10" style={{ transformOrigin: 'center', animation: 'spin 25s linear infinite' }} />
      <circle cx="50%" cy="50%" r="240" fill="none" stroke="url(#glowGrad)" strokeWidth="0.6" strokeDasharray="8 16" style={{ transformOrigin: 'center', animation: 'spinReverse 40s linear infinite' }} />
      <circle cx="50%" cy="50%" r="380" fill="none" stroke="url(#glowGrad)" strokeWidth="0.4" strokeDasharray="10 20" style={{ transformOrigin: 'center', animation: 'spin 60s linear infinite' }} />

      {/* Pulse lines traveling from center outwards */}
      <line x1="50%" y1="50%" x2="20%" y2="20%" stroke="url(#glowGrad)" strokeWidth="1" strokeDasharray="15 30" style={{ animation: 'pulseLine 6s linear infinite' }} />
      <line x1="50%" y1="50%" x2="80%" y2="20%" stroke="url(#glowGrad)" strokeWidth="1" strokeDasharray="15 30" style={{ animation: 'pulseLine 8s linear infinite' }} />
      <line x1="50%" y1="50%" x2="15%" y2="75%" stroke="url(#glowGrad)" strokeWidth="1" strokeDasharray="15 30" style={{ animation: 'pulseLine 10s linear infinite' }} />
      <line x1="50%" y1="50%" x2="85%" y2="80%" stroke="url(#glowGrad)" strokeWidth="1" strokeDasharray="15 30" style={{ animation: 'pulseLine 7s linear infinite' }} />
    </svg>
  );
}

function ProjectPod({ proj, idx, handleDelete, deleting }: any) {
  const icon = PROJECT_ICONS[idx % PROJECT_ICONS.length];
  const wfCount = proj._count?.workflows ?? proj.workflows?.length ?? 0;
  
  const orbitSpeed1 = 12 + (idx % 3) * 4;
  const orbitSpeed2 = 18 + (idx % 2) * 5;

  const themes = ['cyan', 'fuchsia', 'emerald'];
  const theme = themes[idx % themes.length];
  const neonColor = `var(--neon-${theme})`;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      aspectRatio: '1/1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto',
      animation: `floatSlow ${7 + idx}s ease-in-out infinite`,
      animationDelay: `${idx * 0.1}s`,
    }}>
      {/* Orbital rings */}
      <div style={{
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: '50%',
        border: `1px dashed rgba(${theme === 'cyan' ? '0,242,254' : theme === 'fuchsia' ? '243,85,218' : '5,255,196'}, 0.15)`,
        animation: `spin ${orbitSpeed1}s linear infinite`
      }}>
        <div style={{ position: 'absolute', top: -5, left: '50%', width: 10, height: 10, borderRadius: '50%', background: neonColor, boxShadow: `0 0 12px ${neonColor}` }} />
      </div>
      <div style={{
        position: 'absolute',
        width: 260,
        height: 260,
        borderRadius: '50%',
        border: `1px solid rgba(${theme === 'cyan' ? '0,242,254' : theme === 'fuchsia' ? '243,85,218' : '5,255,196'}, 0.05)`,
        animation: `spinReverse ${orbitSpeed2}s linear infinite`
      }}>
        <div style={{ position: 'absolute', bottom: -3, left: '30%', width: 6, height: 6, borderRadius: '50%', background: neonColor, boxShadow: `0 0 8px ${neonColor}` }} />
      </div>

      {/* Main pod core: polygonal cyber-plate */}
      <div 
        className={`cyber-plate-${theme} tech-corners`}
        style={{
          width: 170,
          height: 170,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          textAlign: 'center',
          transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: `rgba(${theme === 'cyan' ? '0,242,254' : theme === 'fuchsia' ? '243,85,218' : '5,255,196'}, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 12, border: `1px solid ${neonColor}` }}>
          {icon}
        </div>

        <h3 style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.3px', margin: '0 0 6px', fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", width: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{proj.name}</h3>
        
        <div style={{ fontSize: 9, color: neonColor, fontWeight: 700, letterSpacing: '0.04em', background: `rgba(${theme === 'cyan' ? '0,242,254' : theme === 'fuchsia' ? '243,85,218' : '5,255,196'}, 0.08)`, border: `1px solid rgba(${theme === 'cyan' ? '0,242,254' : theme === 'fuchsia' ? '243,85,218' : '5,255,196'}, 0.25)`, padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--mono)' }}>
          {wfCount} WORKFLOW{wfCount !== 1 ? 'S' : ''}
        </div>

        <Link href={`/projects/${proj.id}/builder`} style={{ position: 'absolute', inset: 0, zIndex: 5 }} />

        <button
          onClick={e => { e.stopPropagation(); handleDelete(proj.id, proj.name); }}
          disabled={deleting === proj.id}
          style={{
            position: 'absolute',
            bottom: 8,
            width: 22,
            height: 22,
            border: '1px solid rgba(239,68,68,0.3)',
            background: 'rgba(239,68,68,0.08)',
            color: '#f87171',
            cursor: 'pointer',
            fontSize: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            zIndex: 20
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#f87171'; }}
        >
          {deleting === proj.id ? '·' : '✕'}
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('ff_token');
    const u = localStorage.getItem('ff_user');
    if (!token) { router.replace('/login'); return; }
    if (u) setUser(JSON.parse(u));
    loadProjects();
    setTimeout(() => setMounted(true), 50);
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const list = await api.projects.list();
      setProjects(list);
    } catch { router.replace('/login'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const proj = await api.projects.create(form);
      setProjects(p => [proj, ...p]);
      setShowCreate(false);
      setForm({ name: '', description: '' });
    } catch (err: any) { alert(err.message); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.projects.delete(id);
      setProjects(p => p.filter(x => x.id !== id));
    } catch (err: any) { alert(err.message); }
    finally { setDeleting(null); }
  };

  const totalWorkflows = projects.reduce((a, p) => a + (p._count?.workflows ?? p.workflows?.length ?? 0), 0);
  const publishedCount = projects.reduce((a, p) => a + (p.workflows?.filter((w: any) => w.isPublished).length ?? 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', fontFamily: 'Inter, sans-serif' }}>
      {/* Ambient background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '20%', left: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 70%)', animation: 'orb1 18s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(139,92,246,0.06) 0%, transparent 70%)', animation: 'orb2 22s ease-in-out infinite' }} />
      </div>

      {/* ── TOP NAV ─────────────────────────────────── */}
      <nav style={{
        background: 'rgba(10,15,30,0.9)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(20px) saturate(180%)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--grad-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>⚡</div>
            <span style={{ fontSize: 17, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.3px', fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>FlowForge</span>
          </div>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 24 }}>
            {[{ label: 'Dashboard', active: true }].map(n => (
              <a key={n.label} href={(n as any).href || '#'}
                style={{ padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: (n as any).active ? 'var(--text-primary)' : 'var(--text-muted)', background: (n as any).active ? 'rgba(99,102,241,0.1)' : 'transparent', textDecoration: 'none', transition: 'all 0.15s' }}
                onMouseEnter={e => { if (!(n as any).active) (e.currentTarget.style.color = 'var(--text-secondary)'); }}
                onMouseLeave={e => { if (!(n as any).active) (e.currentTarget.style.color = 'var(--text-muted)'); }}>
                {n.label}
              </a>
            ))}
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/settings" style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '6px 12px', borderRadius: 8,
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-muted)', fontSize: 12, textDecoration: 'none',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget as any).style.borderColor = 'var(--border-strong)'; (e.currentTarget as any).style.color = 'var(--text-secondary)'; }}
              onMouseLeave={e => { (e.currentTarget as any).style.borderColor = 'var(--border)'; (e.currentTarget as any).style.color = 'var(--text-muted)'; }}>
              ⚙ Settings
            </Link>
            {/* Avatar */}
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--grad-brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: '#fff',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
            }} onClick={() => router.replace('/login')}>
              {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
          </div>
        </div>
      </nav>

      {/* ── PAGE CONTENT ─────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 28px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          marginBottom: 36,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.45s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <div>
            <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.8px', lineHeight: 1.1, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
              Welcome back{user?.username ? `, ${user.username}` : ''}
              <span style={{ marginLeft: 10, fontSize: 30 }}>👋</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 8 }}>
              Manage your API projects and workflow automations
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '11px 22px', borderRadius: 12, border: 'none',
              background: 'var(--grad-brand)', color: '#fff',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 24px rgba(99,102,241,0.4)',
              transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
              letterSpacing: '0.01em', fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(99,102,241,0.4)'; }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>+</span>
            New Project
          </button>
        </div>

        {/* Stats HUD */}
        <DashboardHud projects={projects} totalWorkflows={totalWorkflows} publishedCount={publishedCount} />

        {/* Projects Constellation */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px', fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
              API Constellation Map
              {!loading && <span style={{ marginLeft: 10, fontSize: 13, fontWeight: 500, color: 'var(--text-faint)', background: 'var(--bg-elevated)', padding: '2px 9px', borderRadius: 'var(--r-full)' }}>{projects.length} nodes</span>}
            </h2>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24, padding: 32 }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 220, borderRadius: '50%' }} />)}
            </div>
          ) : projects.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '80px 24px',
              background: 'rgba(15,23,42,0.4)',
              border: '1px dashed var(--border-strong)',
              borderRadius: 24,
              animation: 'fadeIn 0.4s ease',
            }}>
              <div style={{ fontSize: 56, marginBottom: 16, animation: 'float 3s ease-in-out infinite' }}>🚀</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>No projects yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: 14 }}>
                Spawn your first visual API node to map out your endpoints.
              </p>
              <button onClick={() => setShowCreate(true)} style={{ padding: '11px 24px', borderRadius: 12, border: 'none', background: 'var(--grad-brand)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}>
                + Spawn First Node
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative', width: '100%', minHeight: 460, borderRadius: 24, padding: '40px 24px', background: 'rgba(10,15,30,0.3)', border: '1px solid rgba(99,102,241,0.06)', overflow: 'hidden' }}>
              <ConnectionWeb />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 36, position: 'relative', zIndex: 10 }}>
                {projects.map((proj, idx) => (
                  <ProjectPod key={proj.id} proj={proj} idx={idx} handleDelete={handleDelete} deleting={deleting} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── CREATE PROJECT MODAL ─────────────────────── */}
      {showCreate && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 26 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--grad-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>📦</div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px' }}>Create New Project</h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Set up your API workspace</p>
              </div>
              <button onClick={() => setShowCreate(false)} style={{ marginLeft: 'auto', width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >✕</button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label className="label">Project Name *</label>
                <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="My Awesome API" className="input" autoFocus />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe what this project does..." rows={3}
                  style={{ width: '100%', background: 'var(--bg-void)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 14px', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setShowCreate(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" disabled={creating} className="btn" style={{ flex: 2, background: creating ? 'var(--bg-elevated)' : 'var(--grad-brand)', color: '#fff', boxShadow: creating ? 'none' : 'var(--shadow-btn)' }}>
                  {creating ? <><span className="spinner" />Creating...</> : '✨ Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
