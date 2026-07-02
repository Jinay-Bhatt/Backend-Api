'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Zap, 
  Folder, 
  Settings, 
  Trash2, 
  Plus, 
  GitBranch, 
  Play, 
  Radio,
  Terminal,
  Cpu,
  Database,
  Globe
} from 'lucide-react';
import { api } from '../../services/api';

function getProjectIcon(idx: number, color: string) {
  const size = 18;
  const icons = [
    <Folder size={size} style={{ color }} />,
    <Terminal size={size} style={{ color }} />,
    <Cpu size={size} style={{ color }} />,
    <Globe size={size} style={{ color }} />,
    <Database size={size} style={{ color }} />
  ];
  return icons[idx % icons.length];
}

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
    <div className="card-clean" style={{
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
        { icon: <Folder size={18} color="#6366f1" />, label: 'Projects Deployed', value: projects.length, color: '#6366f1' },
        { icon: <GitBranch size={18} color="#8b5cf6" />, label: 'Total Workflows', value: totalWorkflows, color: '#8b5cf6' },
        { icon: <Play size={18} color="#10b981" />, label: 'Live APIs', value: publishedCount, sub: 'Running in sandbox', color: '#10b981' },
        { icon: <Radio size={18} color="#38bdf8" />, label: 'Gateway Status', value: 'ONLINE', isStatus: true, color: '#38bdf8' }
      ].map((stat, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 160, position: 'relative' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {stat.icon}
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
              {stat.isStatus ? stat.value : <AnimatedCounter value={stat.value} />}
              {stat.isStatus && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />}
            </div>
            {stat.sub && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{stat.sub}</div>}
          </div>
          {i < 3 && <div style={{ position: 'absolute', right: -12, top: '10%', bottom: '10%', width: 1, background: 'var(--border)' }} />}
        </div>
      ))}
    </div>
  );
}

function ProjectCard({ proj, idx, handleDelete, deleting }: any) {
  const colors = ['#6366f1', '#8b5cf6', '#38bdf8', '#10b981', '#f59e0b', '#ec4899'];
  const color = colors[idx % colors.length];
  const icon = getProjectIcon(idx, color);
  const wfCount = proj._count?.workflows ?? proj.workflows?.length ?? 0;

  return (
    <div style={{ position: 'relative' }}>
      <Link href={`/projects/${proj.id}/builder`} style={{ textDecoration: 'none', display: 'block' }}>
        <div className="card card-interactive" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, height: '100%', minHeight: 180 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {proj.name}
              </h3>
            </div>
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); handleDelete(proj.id, proj.name); }}
              disabled={deleting === proj.id}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 6,
                borderRadius: 6,
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 20
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <Trash2 size={14} />
            </button>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
            {proj.description || 'No description provided.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Last updated {new Date(proj.updatedAt || proj.createdAt || Date.now()).toLocaleDateString()}
            </span>
            <span style={{ fontSize: 11, fontWeight: 650, color: 'var(--accent-light)', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', padding: '2px 8px', borderRadius: 4 }}>
              {wfCount} workflow{wfCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </Link>
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
      {/* Ambient background grid */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 600, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.05) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.01) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }} />
      </div>

      {/* ── TOP NAV ─────────────────────────────────── */}
      <nav style={{
        background: 'rgba(5, 5, 5, 0.75)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(20px) saturate(180%)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/FlowForge.png" alt="FlowForge Logo" width="28" height="28" style={{ objectFit: 'contain' }} />
            <span style={{ fontSize: 17, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.3px', fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
              Flow<span style={{ background: 'linear-gradient(135deg, #6366f1, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Forge</span>
            </span>
          </div>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 24 }}>
            {[{ label: 'Dashboard', active: true }].map(n => (
              <a key={n.label} href="#"
                style={{ padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', background: 'rgba(255,255,255,0.03)', textDecoration: 'none' }}>
                {n.label}
              </a>
            ))}
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/settings" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8,
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-muted)', fontSize: 12, textDecoration: 'none',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget as any).style.borderColor = 'var(--border-strong)'; (e.currentTarget as any).style.color = 'var(--text-secondary)'; }}
              onMouseLeave={e => { (e.currentTarget as any).style.borderColor = 'var(--border)'; (e.currentTarget as any).style.color = 'var(--text-muted)'; }}>
              <Settings size={13} /> Settings
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
            <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.8px', lineHeight: 1.1, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
              Welcome back{user?.username ? `, ${user.username}` : ''} 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 8 }}>
              Manage your API projects and workflow automations
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 22px', borderRadius: 100, border: 'none',
              background: 'var(--grad-brand)', color: '#fff',
              fontSize: 14, fontWeight: 650, cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99,102,241,0.25)',
              transition: 'all 0.15s',
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
          >
            <Plus size={16} />
            New Project
          </button>
        </div>

        {/* Stats HUD */}
        <DashboardHud projects={projects} totalWorkflows={totalWorkflows} publishedCount={publishedCount} />

        {/* Projects List */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px', fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
              Your Projects
              {!loading && <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '4px' }}>{projects.length} projects</span>}
            </h2>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 16 }} />)}
            </div>
          ) : projects.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '80px 24px',
              background: 'rgba(15,23,42,0.2)',
              border: '1px dashed var(--border)',
              borderRadius: 16,
              animation: 'fadeIn 0.4s ease',
            }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Folder size={24} color="var(--text-muted)" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>No projects yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>
                Create your first project workspace to map out your API endpoints.
              </p>
              <button onClick={() => setShowCreate(true)} style={{ padding: '10px 24px', borderRadius: 100, border: 'none', background: 'var(--grad-brand)', color: '#fff', fontSize: 14, fontWeight: 650, cursor: 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,0.25)', fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
                Create First Project
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {projects.map((proj, idx) => (
                <ProjectCard key={proj.id} proj={proj} idx={idx} handleDelete={handleDelete} deleting={deleting} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── CREATE PROJECT MODAL ─────────────────────── */}
      {showCreate && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 26 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--grad-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(99,102,241,0.2)' }}>
                <Folder size={18} color="#fff" />
              </div>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.3px' }}>Create New Project</h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Set up your API workspace</p>
              </div>
              <button onClick={() => setShowCreate(false)} style={{ marginLeft: 'auto', width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
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
                  style={{ width: '100%', background: 'var(--bg-void)', border: '1px solid var(--border)', borderRadius: 8, padding: '11px 14px', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setShowCreate(false)} className="btn btn-ghost" style={{ flex: 1, padding: '10px 16px', borderRadius: 8 }}>Cancel</button>
                <button type="submit" disabled={creating} className="btn" style={{ flex: 2, padding: '10px 16px', borderRadius: 8, background: creating ? 'var(--bg-elevated)' : 'var(--grad-brand)', color: '#fff', boxShadow: creating ? 'none' : 'var(--shadow-btn)' }}>
                  {creating ? <><span className="spinner" />Creating...</> : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
