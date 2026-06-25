'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../services/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await api.auth.register(form);
      const res = await api.auth.login({ email: form.email, password: form.password });
      localStorage.setItem('ff_token', res.token);
      localStorage.setItem('ff_user', JSON.stringify(res.user));
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
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
          position: 'absolute', top: '-15%', right: '-10%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          animation: 'orb1 12s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', left: '-10%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
          animation: 'orb2 16s ease-in-out infinite',
        }} />
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(99,102,241,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.02) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }} />
      </div>

      <div style={{
        width: '100%', maxWidth: 440,
        position: 'relative', zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        animation: 'fadeIn 0.5s ease both'
      }}>
        {/* SVG Pipeline Line */}
        <svg style={{ position: 'absolute', top: 50, bottom: 80, width: 4, height: 'calc(100% - 150px)', pointerEvents: 'none', zIndex: 0 }}>
          <line x1="2" y1="0" x2="2" y2="100%" stroke="rgba(99,102,241,0.25)" strokeWidth="2" strokeDasharray="5 5">
            <animate attributeName="stroke-dashoffset" from="10" to="0" dur="1s" repeatCount="indefinite" />
          </line>
        </svg>

        {/* Top Node */}
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
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Initialize Account Core Node</p>
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
          <div className="cyber-plate-fuchsia tech-corners" style={{
            width: '100%',
            padding: '36px 30px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}>
            {/* Username Pod */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="label" style={{ fontSize: 9, color: 'var(--neon-fuchsia)', letterSpacing: '0.12em' }}>[ OPERATOR_HANDLE ]</label>
              <div style={{
                position: 'relative',
                background: 'rgba(2, 6, 23, 0.95)',
                border: '1px solid rgba(243, 85, 218, 0.3)',
                padding: '12px 14px',
                transition: 'all 0.25s',
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}
              onFocusCapture={e => {
                e.currentTarget.style.borderColor = 'var(--neon-fuchsia)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(243, 85, 218, 0.25)';
              }}
              onBlurCapture={e => {
                e.currentTarget.style.borderColor = 'rgba(243, 85, 218, 0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <span style={{ color: 'var(--neon-fuchsia)', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 'bold' }}>{'>'}</span>
                <input
                  type="text" required
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  placeholder="johndoe"
                  style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'var(--mono)' }}
                />
              </div>
            </div>

            {/* Email Pod */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="label" style={{ fontSize: 9, color: 'var(--neon-fuchsia)', letterSpacing: '0.12em' }}>[ IDENTITY_ID ]</label>
              <div style={{
                position: 'relative',
                background: 'rgba(2, 6, 23, 0.95)',
                border: '1px solid rgba(243, 85, 218, 0.3)',
                padding: '12px 14px',
                transition: 'all 0.25s',
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}
              onFocusCapture={e => {
                e.currentTarget.style.borderColor = 'var(--neon-fuchsia)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(243, 85, 218, 0.25)';
              }}
              onBlurCapture={e => {
                e.currentTarget.style.borderColor = 'rgba(243, 85, 218, 0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <span style={{ color: 'var(--neon-fuchsia)', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 'bold' }}>{'>'}</span>
                <input
                  type="email" required
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@company.com"
                  style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'var(--mono)' }}
                />
              </div>
            </div>

            {/* Password Pod */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="label" style={{ fontSize: 9, color: 'var(--neon-fuchsia)', letterSpacing: '0.12em' }}>[ TERMINAL_PASSKEY ]</label>
              <div style={{
                position: 'relative',
                background: 'rgba(2, 6, 23, 0.95)',
                border: '1px solid rgba(243, 85, 218, 0.3)',
                padding: '12px 14px',
                transition: 'all 0.25s',
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}
              onFocusCapture={e => {
                e.currentTarget.style.borderColor = 'var(--neon-fuchsia)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(243, 85, 218, 0.25)';
              }}
              onBlurCapture={e => {
                e.currentTarget.style.borderColor = 'rgba(243, 85, 218, 0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <span style={{ color: 'var(--neon-fuchsia)', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 'bold' }}>{'>'}</span>
                <input
                  type="password" required
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
                background: loading ? 'rgba(30, 41, 59, 0.5)' : 'rgba(243, 85, 218, 0.08)',
                color: loading ? 'var(--text-muted)' : 'var(--neon-fuchsia)',
                border: '1.5px solid var(--neon-fuchsia)',
                fontFamily: 'var(--mono)',
                fontSize: 13,
                fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.25s',
                boxShadow: '0 0 10px rgba(243, 85, 218, 0.1)',
                letterSpacing: '0.05em'
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = 'rgba(243, 85, 218, 0.2)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(243, 85, 218, 0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
              onMouseLeave={e => { e.currentTarget.style.background = loading ? 'rgba(30, 41, 59, 0.5)' : 'rgba(243, 85, 218, 0.08)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(243, 85, 218, 0.1)'; e.currentTarget.style.transform = 'none'; }}
            >
              {loading ? <><span className="spinner" /> INITIALIZING LINK...</> : 'ESTABLISH SECURE LINK //'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: 24, fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, position: 'relative', zIndex: 10 }}>
          <span>Already registered operator?</span>
          <Link href="/login" style={{ color: 'var(--accent-light)', fontWeight: 800, textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--accent-light)')}>
            Access Workspace Core →
          </Link>
        </div>
      </div>
    </main>
  );
}
