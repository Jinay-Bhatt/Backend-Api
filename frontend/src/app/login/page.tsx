'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../services/api';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.login(form);
      localStorage.setItem('ff_token', res.token);
      localStorage.setItem('ff_user', JSON.stringify(res.user));
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated gradient orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-15%', left: '-10%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.16) 0%, transparent 65%)',
          animation: 'orb1 14s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', right: '-5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 65%)',
          animation: 'orb2 18s ease-in-out infinite',
        }} />
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(99,102,241,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.02) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }} />
      </div>

      {/* Interconnected form layout (No Cards) */}
      <div style={{
        width: '100%', maxWidth: 440,
        position: 'relative', zIndex: 10,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(24px)',
        transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* SVG Pipeline Line (Behind fields) */}
        <svg style={{ position: 'absolute', top: 50, bottom: 80, width: 4, height: 'calc(100% - 150px)', pointerEvents: 'none', zIndex: 0 }}>
          <line x1="2" y1="0" x2="2" y2="100%" stroke="rgba(99,102,241,0.25)" strokeWidth="2" strokeDasharray="5 5">
            <animate attributeName="stroke-dashoffset" from="10" to="0" dur="1s" repeatCount="indefinite" />
          </line>
        </svg>

        {/* Top Node: Logo Core */}
        <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'radial-gradient(circle at center, #6366f1 0%, #8b5cf6 100%)',
            border: '2px solid rgba(255,255,255,0.1)',
            boxShadow: '0 0 30px rgba(99,102,241,0.5), inset 0 0 15px rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, marginBottom: 16,
            animation: 'float 3.5s ease-in-out infinite',
          }}>⚡</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px', fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
            Flow<span className="gradient-text">Forge</span>
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Access Node Server API Gateway</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 16,
            padding: '10px 18px',
            marginBottom: 20,
            color: '#fca5a5',
            fontSize: 12,
            zIndex: 5,
            animation: 'slideInUp 0.3s var(--ease-spring)',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Main Pipeline form stack */}
        <form onSubmit={handleSubmit} style={{ width: '100%', position: 'relative', zIndex: 5 }}>
          <div className="cyber-plate-cyan tech-corners" style={{
            width: '100%',
            padding: '36px 30px',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}>
            {/* Email Pod */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="label" style={{ fontSize: 9, color: 'var(--neon-cyan)', letterSpacing: '0.12em' }}>[ IDENTITY_ID ]</label>
              <div style={{
                position: 'relative',
                background: 'rgba(2, 6, 23, 0.95)',
                border: '1px solid rgba(0, 242, 254, 0.3)',
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
                e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <span style={{ color: 'var(--neon-cyan)', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 'bold' }}>{'>'}</span>
                <input
                  type="email" required autoComplete="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@company.com"
                  style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'var(--mono)' }}
                />
              </div>
            </div>

            {/* Password Pod */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="label" style={{ fontSize: 9, color: 'var(--neon-cyan)', letterSpacing: '0.12em' }}>[ TERMINAL_PASSKEY ]</label>
              <div style={{
                position: 'relative',
                background: 'rgba(2, 6, 23, 0.95)',
                border: '1px solid rgba(0, 242, 254, 0.3)',
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
                e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <span style={{ color: 'var(--neon-cyan)', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 'bold' }}>{'>'}</span>
                <input
                  type="password" required autoComplete="current-password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'var(--mono)' }}
                />
              </div>
            </div>

            {/* Action Trigger Node */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? 'rgba(30, 41, 59, 0.5)' : 'rgba(0, 242, 254, 0.08)',
                color: loading ? 'var(--text-muted)' : 'var(--neon-cyan)',
                border: '1.5px solid var(--neon-cyan)',
                fontFamily: 'var(--mono)',
                fontSize: 13,
                fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.25s',
                boxShadow: '0 0 10px rgba(0, 242, 254, 0.1)',
                letterSpacing: '0.05em'
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = 'rgba(0, 242, 254, 0.2)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 242, 254, 0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
              onMouseLeave={e => { e.currentTarget.style.background = loading ? 'rgba(30, 41, 59, 0.5)' : 'rgba(0, 242, 254, 0.08)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 242, 254, 0.1)'; e.currentTarget.style.transform = 'none'; }}
            >
              {loading ? <><span className="spinner" /> SYNCHRONIZING CORE...</> : 'ESTABLISH SECURE LINK //'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: 24, fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, position: 'relative', zIndex: 10 }}>
          <span>New Operator?</span>
          <Link href="/register" style={{ color: 'var(--accent-light)', fontWeight: 800, textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--accent-light)')}>
            Initialize account node →
          </Link>
        </div>

        {/* Floating details */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40, flexWrap: 'wrap', position: 'relative', zIndex: 10 }}>
          {['⚡ Visual Mesh', '🛡️ Dynamic Gateway', '✨ AI Builder'].map((tag, i) => (
            <span key={tag} style={{
              padding: '4px 12px',
              borderRadius: 20,
              background: 'rgba(10,15,30,0.5)',
              border: '1px solid rgba(99,102,241,0.08)',
              color: 'var(--text-muted)',
              fontSize: 10,
              fontWeight: 600,
              backdropFilter: 'blur(10px)',
              animation: `fadeIn 0.5s ease ${0.1 + i * 0.1}s both`,
              fontFamily: 'var(--mono)'
            }}>{tag}</span>
          ))}
        </div>
      </div>
    </main>
  );
}
