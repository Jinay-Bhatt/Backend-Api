'use client';

import Link from 'next/link';
import { Shield, FileText } from 'lucide-react';

export default function TermsPage() {
  const sections = [
    {
      title: '1. Service Scope and Ownership',
      content:
        'JBSnap provides visual API design, node graph compilation, and serverless gateway execution tools. All TypeScript, Fastify, and Prisma code generated or exported through the platform is 100% your intellectual property. JBSnap claims no ownership or license rights over code you export.',
    },
    {
      title: '2. Sandbox and Execution Limits',
      content:
        'Custom JavaScript logic executed within visual nodes runs in isolated V8 sandbox environments. Each execution is subject to a hard 200ms CPU timeout and strictly restricted memory parameters. Scripts attempting filesystem access, network circumvention, or infinite loops will be terminated automatically.',
    },
    {
      title: '3. Account Security and Credentials',
      content:
        'You are responsible for safeguarding your authentication credentials, API keys, and repository personal access tokens. JBSnap encrypts all stored secrets at rest using AES-256 and never exposes decrypted keys in client-side bundles or public endpoints.',
    },
    {
      title: '4. Gateway Usage and Fair Rate Limits',
      content:
        'The JBSnap hosted edge gateway enforces per-plan throughput and rate limits to guarantee quality of service across all users. Automated abuse, denial of service attacks, or unauthorized scanning against platform infrastructure will result in immediate API key suspension.',
    },
    {
      title: '5. Availability and Service Guarantees',
      content:
        'While we strive for 99.9% uptime across production gateway endpoints, free-tier services are provided without express warranty. For mission-critical workloads, we encourage exporting source code directly to your private cloud infrastructure.',
    },
    {
      title: '6. Modifications and Termination',
      content:
        'We may update these terms periodically to reflect new features or security requirements. You may terminate your account at any time from your settings panel, which will purge your projects and encrypted credentials from our primary databases.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#030303', color: '#f1f5f9', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#09090b', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#ffffff' }}>
            <img src="/logo.jpg" alt="JBSnap" width={22} height={22} style={{ borderRadius: '50%', objectFit: 'cover' }} />
            <span style={{ fontSize: 15, fontWeight: 800 }}>JBSnap</span>
            <span style={{ fontSize: 11, color: '#71717a', border: '1px solid rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Legal</span>
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

      {/* Main Content */}
      <main style={{ maxWidth: 780, margin: '0 auto', padding: '64px 24px 96px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 11, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
          <FileText size={12} /> Terms of Service
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: '#ffffff', letterSpacing: '-1px', margin: '0 0 12px 0' }}>
          Terms of Service
        </h1>
        <p style={{ fontSize: 14, color: '#71717a', marginBottom: 40, lineHeight: 1.6 }}>
          Last updated: September 21, 2026. Please read these terms carefully before utilizing the JBSnap platform, visual pipeline compiler, or edge gateway.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {sections.map((s) => (
            <div
              key={s.title}
              style={{
                padding: '24px 28px',
                borderRadius: 8,
                background: '#09090b',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f4f4f5', margin: '0 0 12px 0' }}>
                {s.title}
              </h2>
              <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>
                {s.content}
              </p>
            </div>
          ))}
        </div>

        {/* Footer info box */}
        <div style={{ marginTop: 48, padding: '20px 24px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Shield size={20} color="#10b981" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
            Questions regarding our terms or licensing agreements? Reach out to our legal engineering team at <a href="mailto:support@jbsnap.app" style={{ color: '#ffffff', textDecoration: 'underline' }}>support@jbsnap.app</a>.
          </div>
        </div>
      </main>
    </div>
  );
}
