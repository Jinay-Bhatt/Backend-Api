'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, User, Mail, Lock } from 'lucide-react';
import { api } from '../../services/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

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
      {/* Subtle top radial gradient and dotted grid */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 65%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.015) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />
      </div>

      <div style={{
        width: '100%', maxWidth: 400,
        position: 'relative', zIndex: 10,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(16px)',
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Logo Node */}
        <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', marginBottom: 28, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src="/FlowForge.png" alt="FlowForge Logo" width="44" height="44" style={{ objectFit: 'contain', marginBottom: 16 }} />
          <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px', fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
            Flow<span className="gradient-text-static">Forge</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Create your FlowForge account</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 100,
            padding: '8px 16px',
            marginBottom: 20,
            color: '#fca5a5',
            fontSize: 12,
            zIndex: 5,
            animation: 'slideInUp 0.3s var(--ease-spring)',
          }}>
            {error}
          </div>
        )}

        {/* Main form card */}
        <form onSubmit={handleSubmit} style={{ width: '100%', position: 'relative', zIndex: 5 }}>
          <div className="card-clean" style={{
            width: '100%',
            padding: '32px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}>
            {/* Username Pod */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="label">Username</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                  <User size={16} />
                </span>
                <input
                  type="text" required
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  placeholder="johndoe"
                  className="input"
                  style={{ paddingLeft: 42 }}
                />
              </div>
            </div>

            {/* Email Pod */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                  <Mail size={16} />
                </span>
                <input
                  type="email" required
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@company.com"
                  className="input"
                  style={{ paddingLeft: 42 }}
                />
              </div>
            </div>

            {/* Password Pod */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} />
                </span>
                <input
                  type="password" required
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="•••••••• (min 6 chars)"
                  className="input"
                  style={{ paddingLeft: 42 }}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: loading ? 'rgba(255, 255, 255, 0.15)' : '#ffffff',
                color: loading ? 'var(--text-muted)' : '#000000',
                border: 'none',
                borderRadius: 100,
                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.15s',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(255, 255, 255, 0.12)',
                letterSpacing: '-0.01em',
                marginTop: 8
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
            >
              {loading ? <><span className="spinner" /> Creating account...</> : 'Create Account'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: 20, fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, position: 'relative', zIndex: 10 }}>
          <span>Already have an account?</span>
          <Link href="/login" style={{ color: 'var(--accent-light)', fontWeight: 600, textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--accent-light)')}>
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
