'use client';
import Link from 'next/link';

export default function AboutPage() {
  const contactEmail = 'dualithjbsnap@gmail.com';

  return (
    <div style={{ minHeight: '100vh', background: '#020202', color: '#f1f5f9', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Mini header */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '20px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#ffffff' }}>
            <img src="/logo.jpg" alt="JBSnap" width={24} height={24} style={{ borderRadius: '50%', objectFit: 'cover' }} />
            <span style={{ fontSize: 16, fontWeight: 900 }}>
              JB<span style={{ color: '#a1a1aa' }}>Snap</span><span style={{ color: '#94a3b8', marginLeft: 6, fontWeight: 500, fontSize: 13.5 }}>Company</span>
            </span>
          </Link>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12.5,
              fontWeight: 600,
              color: '#cbd5e1',
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = '#cbd5e1';
            }}
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ maxWidth: 740, margin: '0 auto', padding: '80px 32px' }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>About Us</span>
        <h1 style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-1.5px', margin: '8px 0 24px 0', color: '#ffffff' }}>Company Vision</h1>
        <p style={{ fontSize: 17, color: '#cbd5e1', lineHeight: 1.7, marginBottom: 24 }}>
          At JBSnap, we believe database and backend integration should be direct, fast, and visual.
        </p>
        <p style={{ fontSize: 16, color: '#94a3b8', lineHeight: 1.7, marginBottom: 40 }}>
          Traditional integration workflows require writing boilerplate, configuring routing servers, maintaining schema migrations, and managing deployment pipelines. JBSnap replaces all of that with a visual DAG workflow editor that compiles directly to production-grade Fastify + TypeScript codebases.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 56 }}>
          <div style={{ padding: 24, borderRadius: 12, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', margin: '0 0 8px 0' }}>Our Mission</h3>
            <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>To empower developers to deploy custom API gateways in under 60 seconds with absolute performance confidence.</p>
          </div>
          <div style={{ padding: 24, borderRadius: 12, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', margin: '0 0 8px 0' }}>Our Commitment</h3>
            <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>Zero vendor lock-in. Visual design compiles to clean Fastify + TypeScript that you can export and host anywhere.</p>
          </div>
        </div>

        <div style={{ padding: 24, borderRadius: 16, background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', marginBottom: 4 }}>Have Questions or Feedback?</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>Official Contact: <span style={{ color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace' }}>{contactEmail}</span></div>
          </div>
          <Link href="/contact" style={{ padding: '10px 18px', borderRadius: 10, background: '#6366f1', color: '#ffffff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
