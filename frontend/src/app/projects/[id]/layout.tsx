'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: 'builder',   icon: '⚡', label: 'Builder',   color: '#818cf8' },
  { href: 'monitor',   icon: '📡', label: 'Monitor',   color: '#34d399' },
  { href: 'analytics', icon: '📊', label: 'Analytics', color: '#38bdf8' },
  { href: 'gateway',   icon: '🛡️', label: 'Gateway',   color: '#f97316' },
  { href: 'services',  icon: '🔗', label: 'Services',  color: '#a78bfa' },
];

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const projectId = params?.id as string;
  const [project, setProject] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('ff_token');
    const u = localStorage.getItem('ff_user');
    if (!token) { router.replace('/login'); return; }
    if (u) setUser(JSON.parse(u));
    if (projectId) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()).then(d => setProject(d)).catch(() => {});
    }
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [projectId]);

  const activeTab = NAV_ITEMS.find(n => pathname?.includes(`/${n.href}`))?.href || 'builder';
  const activeItem = NAV_ITEMS.find(n => n.href === activeTab);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>
      {/* ── TOP NAV ─────────────────────────────────── */}
      <nav style={{
        background: scrolled ? 'rgba(10,15,30,0.97)' : 'rgba(10,15,30,0.9)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(24px) saturate(180%)',
        position: 'sticky', top: 0, zIndex: 100,
        transition: 'background 0.3s',
      }}>
        {/* Breadcrumb row */}
        <div style={{ padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none', padding: '4px 8px', borderRadius: 7, transition: 'background 0.15s', color: 'var(--text-muted)' }}
            onMouseEnter={e => { (e.currentTarget as any).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as any).style.color = 'var(--text-secondary)'; }}
            onMouseLeave={e => { (e.currentTarget as any).style.background = 'transparent'; (e.currentTarget as any).style.color = 'var(--text-muted)'; }}>
            <img src="/FlowForge.png" alt="FlowForge Logo" width="26" height="26" style={{ objectFit: 'contain' }} />
            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>FlowForge</span>
          </Link>
          <span style={{ color: 'var(--text-faint)', fontSize: 16 }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {project?.name || <span style={{ color: 'var(--text-faint)' }}>Loading...</span>}
          </span>
          {activeItem && (
            <>
              <span style={{ color: 'var(--text-faint)', fontSize: 16 }}>/</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: activeItem.color }}>
                {activeItem.icon} {activeItem.label}
              </span>
            </>
          )}

          {/* Right side */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/settings" style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, textDecoration: 'none', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 5 }}
              onMouseEnter={e => { (e.currentTarget as any).style.borderColor = 'var(--border-strong)'; (e.currentTarget as any).style.color = 'var(--text-secondary)'; }}
              onMouseLeave={e => { (e.currentTarget as any).style.borderColor = 'var(--border)'; (e.currentTarget as any).style.color = 'var(--text-muted)'; }}>
              ⚙ Settings
            </Link>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--grad-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', cursor: 'pointer', boxShadow: '0 2px 8px rgba(99,102,241,0.3)', flexShrink: 0 }}>
              {user?.username?.[0]?.toUpperCase() || '?'}
            </div>
          </div>
        </div>

        {/* Tab row */}
        <div style={{ padding: '0 20px', display: 'flex', gap: 6, borderTop: '1px solid rgba(255,255,255,0.03)', background: '#020617', paddingBlock: '6px' }}>
          {NAV_ITEMS.map(item => {
            const isActive = activeTab === item.href;
            return (
              <Link key={item.href} href={`/projects/${projectId}/${item.href}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 18px',
                  textDecoration: 'none',
                  fontSize: 12, fontWeight: isActive ? 800 : 600,
                  color: isActive ? item.color : 'var(--text-muted)',
                  border: isActive ? `1.5px solid ${item.color}` : '1px solid rgba(255,255,255,0.04)',
                  background: isActive ? `${item.color}10` : 'rgba(10, 15, 30, 0.4)',
                  transition: 'all 0.25s',
                  position: 'relative',
                  fontFamily: 'var(--mono)',
                  letterSpacing: '0.04em',
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                  transform: isActive ? 'translateY(-2px)' : 'none',
                  boxShadow: isActive ? `0 4px 15px ${item.color}15, inset 0 0 10px ${item.color}05` : 'none'
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as any).style.color = 'var(--text-secondary)';
                    (e.currentTarget as any).style.background = 'rgba(255,255,255,0.02)';
                    (e.currentTarget as any).style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as any).style.color = 'var(--text-muted)';
                    (e.currentTarget as any).style.background = 'rgba(10, 15, 30, 0.4)';
                    (e.currentTarget as any).style.transform = 'none';
                  }
                }}
              >
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                <span>{item.label.toUpperCase()}</span>
                {isActive && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Page content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}
