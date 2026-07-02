'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../services/api';

function IntegrationPipeline({ provider, repositoryName }: { provider: string; repositoryName?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '32px 20px', background: 'rgba(10,15,30,0.5)', border: '1px solid rgba(0, 242, 254, 0.15)', borderRadius: 0, marginBottom: 24, overflow: 'hidden', position: 'relative' }} className="tech-corners">
      <div style={{ position: 'absolute', inset: 0, opacity: 0.08, background: 'radial-gradient(circle, var(--accent) 0%, transparent 80%)' }} />
      
      {/* Node 1: Local Workspace */}
      <div className="cyber-plate-cyan tech-corners" style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, zIndex: 2, animation: 'float 3s ease-in-out infinite' }}>⚡</div>
      
      {/* Connector 1 */}
      <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-fuchsia))', position: 'relative', minWidth: 40 }}>
        <div style={{ position: 'absolute', top: -3, left: 0, width: 8, height: 8, borderRadius: '50%', background: '#fff', boxShadow: '0 0 8px #fff', animation: 'pulseLine 2s linear infinite' }} />
      </div>

      {/* Node 2: Compile Engine */}
      <div className="cyber-plate-fuchsia tech-corners" style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, zIndex: 2, animation: 'float 3s ease-in-out infinite', animationDelay: '0.5s' }}>📦</div>
      
      {/* Connector 2 */}
      <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg, var(--neon-fuchsia), var(--neon-emerald))', position: 'relative', minWidth: 40 }}>
        <div style={{ position: 'absolute', top: -3, left: 0, width: 8, height: 8, borderRadius: '50%', background: '#fff', boxShadow: '0 0 8px #fff', animation: 'pulseLine 2s linear infinite', animationDelay: '1s' }} />
      </div>

      {/* Node 3: Git Repo */}
      <div className="cyber-plate-emerald tech-corners" style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, zIndex: 2, animation: 'float 3s ease-in-out infinite', animationDelay: '1s' }}>
        {provider === 'GITLAB' ? '🦊' : '🐙'}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [gitConfig, setGitConfig] = useState<any>(null);
  const [gitForm, setGitForm] = useState({ repositoryName: '', accessToken: '', provider: 'GITHUB' });
  const [savingGit, setSavingGit] = useState(false);
  const [gitSaved, setGitSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'git' | 'profile' | 'export'>('git');

  useEffect(() => {
    const token = localStorage.getItem('ff_token');
    const u = localStorage.getItem('ff_user');
    if (!token) { router.replace('/login'); return; }
    if (u) setUser(JSON.parse(u));
    loadGitConfig();
  }, []);

  const loadGitConfig = async () => {
    try {
      const res = await api.git.getConfig();
      if (res.config) {
        setGitConfig(res.config);
        setGitForm(f => ({ ...f, repositoryName: res.config.repositoryName }));
      }
    } catch {}
  };

  const handleSaveGit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gitForm.repositoryName.trim() || !gitForm.accessToken.trim()) return;
    setSavingGit(true);
    try {
      await api.git.saveConfig(gitForm);
      await loadGitConfig();
      setGitSaved(true);
      setTimeout(() => setGitSaved(false), 2500);
      setGitForm(f => ({ ...f, accessToken: '' }));
    } catch (err: any) { alert(err.message); }
    finally { setSavingGit(false); }
  };

  const logout = () => { localStorage.clear(); router.replace('/login'); };

  const TABS = [
    { key: 'git', icon: '🐙', label: 'GitHub / GitLab' },
    { key: 'profile', icon: '👤', label: 'Profile Settings' },
    { key: 'export', icon: '📦', label: 'API Keys & Codebase' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Nav */}
      <nav style={{ background: 'rgba(10,15,30,0.9)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--text-secondary)' }}>
            <img src="/FlowForge.png" alt="FlowForge Logo" width="28" height="28" style={{ objectFit: 'contain' }} />
            <span style={{ fontWeight: 800, fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>FlowForge</span>
          </Link>
          <span style={{ color: 'var(--text-faint)' }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Settings</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <Link href="/dashboard" style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, textDecoration: 'none', fontWeight: 600 }}>← Dashboard</Link>
            <button onClick={logout} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)', background: 'transparent', color: '#fca5a5', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Sign out</button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 24px', animation: 'fadeIn 0.4s ease both' }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.5px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>⚙️ Settings</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 14 }}>Configure external code repositories, profile preferences, and key exports.</p>

        {/* Glass Tab nav */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key as any)}
              className={activeTab === t.key ? `cyber-plate-${t.key === 'git' ? 'cyan' : t.key === 'profile' ? 'fuchsia' : 'emerald'} tech-corners` : ""}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 16px',
                border: activeTab === t.key ? 'none' : '1px solid rgba(255,255,255,0.06)',
                background: activeTab === t.key ? `rgba(${t.key === 'git' ? '0, 242, 254' : t.key === 'profile' ? '243, 85, 218' : '5, 255, 196'}, 0.05)` : 'rgba(10, 15, 30, 0.4)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
                color: activeTab === t.key ? `var(--neon-${t.key === 'git' ? 'cyan' : t.key === 'profile' ? 'fuchsia' : 'emerald'})` : 'var(--text-muted)',
                transition: 'all 0.25s',
                fontFamily: 'var(--mono)'
              }}>
              {t.icon} {t.label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ── GIT TAB ── */}
        {activeTab === 'git' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.3s ease both' }}>
            <IntegrationPipeline provider={gitForm.provider} repositoryName={gitConfig?.repositoryName} />
            
            {gitConfig && (
              <div className="cyber-plate-emerald tech-corners" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 24 }}>{gitConfig.provider === 'GITHUB' ? '🐙' : '🦊'}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--neon-emerald)', fontFamily: 'var(--mono)' }}>✓ Sync Active — Connected to {gitConfig.provider}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, fontFamily: 'var(--mono)' }}>{gitConfig.repositoryName} → {gitConfig.repositoryUrl}</div>
                </div>
              </div>
            )}

            <div className="cyber-plate-cyan tech-corners" style={{ padding: 28 }}>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6, fontFamily: 'var(--mono)', color: 'var(--neon-cyan)' }}>[ CONNECT_REPOSITORY_SYNC ]</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Link a repository to automatically commit and push compiles directly to Git.</div>

              <form onSubmit={handleSaveGit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label className="label" style={{ color: 'var(--neon-cyan)' }}>Git Provider</label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {['GITHUB', 'GITLAB'].map(p => (
                      <button key={p} type="button" onClick={() => setGitForm(f => ({ ...f, provider: p }))}
                        className={gitForm.provider === p ? `cyber-plate-${p === 'GITHUB' ? 'cyan' : 'fuchsia'} tech-corners` : ''}
                        style={{
                          flex: 1,
                          padding: '12px',
                          border: gitForm.provider === p ? 'none' : '1px solid var(--border)',
                          background: gitForm.provider === p ? `rgba(${p === 'GITHUB' ? '0, 242, 254' : '243, 85, 218'}, 0.05)` : 'transparent',
                          color: gitForm.provider === p ? (p === 'GITHUB' ? 'var(--neon-cyan)' : 'var(--neon-fuchsia)') : 'var(--text-secondary)',
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontFamily: 'var(--mono)'
                        }}>
                        {p === 'GITHUB' ? '🐙' : '🦊'} {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label className="label" style={{ color: 'var(--neon-cyan)' }}>Repository Namespace & Name</label>
                  <div style={{
                    position: 'relative',
                    background: 'rgba(2, 6, 23, 0.95)',
                    border: '1px solid rgba(0, 242, 254, 0.25)',
                    padding: '12px 14px',
                    transition: 'all 0.25s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}
                  onFocusCapture={e => {
                    e.currentTarget.style.borderColor = 'var(--neon-cyan)';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 242, 254, 0.25)';
                  }}
                  onBlurCapture={e => {
                    e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.25)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <span style={{ color: 'var(--neon-cyan)', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 'bold' }}>{'>'}</span>
                    <input
                      required value={gitForm.repositoryName}
                      onChange={e => setGitForm(f => ({ ...f, repositoryName: e.target.value }))}
                      placeholder="username/my-flowforge-api"
                      style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'var(--mono)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label className="label" style={{ color: 'var(--neon-cyan)' }}>Personal Access Token (repo scope)</label>
                  <div style={{
                    position: 'relative',
                    background: 'rgba(2, 6, 23, 0.95)',
                    border: '1px solid rgba(0, 242, 254, 0.25)',
                    padding: '12px 14px',
                    transition: 'all 0.25s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}
                  onFocusCapture={e => {
                    e.currentTarget.style.borderColor = 'var(--neon-cyan)';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 242, 254, 0.25)';
                  }}
                  onBlurCapture={e => {
                    e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.25)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <span style={{ color: 'var(--neon-cyan)', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 'bold' }}>{'>'}</span>
                    <input
                      required type="password" value={gitForm.accessToken}
                      onChange={e => setGitForm(f => ({ ...f, accessToken: e.target.value }))}
                      placeholder="ghp_••••••••••••••••••••"
                      style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'var(--mono)' }}
                    />
                  </div>
                  <div style={{ marginTop: 4, fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
                    💡 Securely encrypted using AES-256-GCM. Create a token with <strong style={{ color: 'var(--accent-light)' }}>repo</strong> access scope.
                  </div>
                </div>

                <button type="submit" disabled={savingGit}
                  style={{
                    padding: '14px',
                    background: savingGit ? 'rgba(30, 41, 59, 0.5)' : gitSaved ? 'rgba(16,185,129,0.1)' : 'rgba(0, 242, 254, 0.08)',
                    color: savingGit ? 'var(--text-muted)' : gitSaved ? 'var(--success)' : 'var(--neon-cyan)',
                    border: `1.5px solid ${gitSaved ? 'var(--success)' : 'var(--neon-cyan)'}`,
                    fontFamily: 'var(--mono)',
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: savingGit ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.25s',
                    boxShadow: '0 0 10px rgba(0, 242, 254, 0.1)',
                    letterSpacing: '0.05em'
                  }}
                  onMouseEnter={e => { if (!savingGit) { e.currentTarget.style.background = gitSaved ? 'rgba(16,185,129,0.15)' : 'rgba(0, 242, 254, 0.2)'; e.currentTarget.style.boxShadow = `0 0 20px ${gitSaved ? 'rgba(16,185,129,0.4)' : 'rgba(0, 242, 254, 0.4)'}`; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
                  onMouseLeave={e => { e.currentTarget.style.background = savingGit ? 'rgba(30, 41, 59, 0.5)' : gitSaved ? 'rgba(16,185,129,0.1)' : 'rgba(0, 242, 254, 0.08)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 242, 254, 0.1)'; e.currentTarget.style.transform = 'none'; }}
                >
                  {savingGit ? <><span className="spinner" /> SAVING INTEGRATION...</> : gitSaved ? '✓ INTEGRATION PIPELINE SYNCED SUCCESSFULLY' : 'LINK INTEGRATION PIPELINE //'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {activeTab === 'profile' && (
          <div style={{ animation: 'fadeIn 0.3s ease both' }}>
            <div className="cyber-plate-fuchsia tech-corners" style={{ padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
                <div style={{ width: 64, height: 64, borderRadius: 0, background: 'var(--grad-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, boxShadow: '0 4px 16px rgba(243, 85, 218, 0.35)', animation: 'float 3.5s ease-in-out infinite' }} className="tech-corners">
                  {user?.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div style={{ fontSize: 19, fontWeight: 900, fontFamily: 'var(--mono)', color: 'var(--neon-fuchsia)' }}>{user?.username}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2, fontFamily: 'var(--mono)' }}>{user?.email}</div>
                </div>
              </div>
              {[{ label: 'Registered Username', value: user?.username }, { label: 'Primary Email address', value: user?.email }, { label: 'Account Created', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : '—' }].map(f => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(243, 85, 218, 0.15)' }}>
                  <span style={{ width: 180, fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--mono)' }}>{f.label}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, fontFamily: 'var(--mono)' }}>{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── EXPORT TAB ── */}
        {activeTab === 'export' && (
          <div style={{ animation: 'fadeIn 0.3s ease both' }}>
            <div className="cyber-plate-emerald tech-corners" style={{ padding: 28 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--neon-emerald)', marginBottom: 6, fontFamily: 'var(--mono)' }}>[ COMPILATION_BUNDLE_MANIFEST ]</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>When exporting workflows, FlowForge packages a production codebase built on standard enterprise software:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  '🚀 Fastify Node.js HTTP server routing',
                  '💎 Prisma ORM Client models & PostgreSQL adapter',
                  '🐳 Docker containment & docker-compose configurations',
                  '🔒 Secure env.example configuration templates',
                  '📜 Dynamic sandbox virtual machine routing scripts',
                  '🛠️ Comprehensive OpenAPI dynamic documentation charts'
                ].map(f => (
                  <div key={f} style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, fontFamily: 'var(--mono)' }}>
                    <span style={{ color: 'var(--neon-emerald)' }}>▶</span> {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
