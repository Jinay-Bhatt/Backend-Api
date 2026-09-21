'use client';

import Link from 'next/link';
import { Lock, Shield } from 'lucide-react';

export default function PrivacyPage() {
  const sections = [
    {
      title: '1. Information We Collect',
      content:
        'We collect account email addresses and cryptographic password hashes required for user authentication. When you save third-party integration secrets (such as GitHub personal access tokens or external database connection URIs), these are stored as encrypted blobs and never indexed or inspected.',
    },
    {
      title: '2. Code and Telemetry Privacy',
      content:
        'Your visual schemas, custom JavaScript node code, and exported Fastify artifacts remain completely private to your account. JBSnap does not use your private workflow logic, endpoint schemas, or proprietary business logic to train artificial intelligence models.',
    },
    {
      title: '3. Gateway Execution Logs',
      content:
        'Live execution telemetry (status codes, request latencies, and system trace payloads) is temporarily buffered in memory to power your real-time analytics monitors. Telemetry retention is strictly limited to your plan tier (up to 7 days for Pro accounts) and permanently purged thereafter.',
    },
    {
      title: '4. Third-Party Integrations',
      content:
        'When you connect GitHub or GitLab to automate repository commits, JBSnap only requests the minimum OAuth and repository scopes required to push generated TypeScript files to your designated branch.',
    },
    {
      title: '5. Data Security Architecture',
      content:
        'All traffic traversing the JBSnap gateway is encrypted in transit via TLS 1.3. Database connection pools and sensitive credentials are encrypted at rest with AES-256-GCM. We conduct automated vulnerability scans across our microservice mesh.',
    },
    {
      title: '6. Your Rights and Data Deletion',
      content:
        'You retain the right to export your complete workspace manifests and delete your account at any time. Triggering an account deletion permanently scrubs all associated projects, workflows, and encrypted credentials across our primary databases and backups within 48 hours.',
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
          <Lock size={12} /> Privacy Policy
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: '#ffffff', letterSpacing: '-1px', margin: '0 0 12px 0' }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 14, color: '#71717a', marginBottom: 40, lineHeight: 1.6 }}>
          Last updated: September 21, 2026. This policy outlines our strict commitments to data isolation, credential encryption, and developer ownership.
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
            Security inquiries or requests for data deletion can be directed to our privacy compliance desk at <a href="mailto:privacy@jbsnap.app" style={{ color: '#ffffff', textDecoration: 'underline' }}>privacy@jbsnap.app</a>.
          </div>
        </div>
      </main>
    </div>
  );
}
