'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../../services/api';

export default function GatewayPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedWfId, setSelectedWfId] = useState('');
  const [config, setConfig] = useState<any>({ requireJwt: false, requireApiKey: false, apiKeyValue: '', rateLimitLimit: '', rateLimitWindow: '', corsEnabled: true, allowedOrigins: '*' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    api.workflows.list(projectId).then(list => {
      setWorkflows(list);
      if (list.length > 0) setSelectedWfId(list[0].id);
    });
  }, [projectId]);

  useEffect(() => {
    if (!selectedWfId) return;
    setLoading(true);
    api.workflows.gatewayConfig(selectedWfId).then(cfg => {
      if (cfg) setConfig({ requireJwt: cfg.requireJwt || false, requireApiKey: cfg.requireApiKey || false, apiKeyValue: '', rateLimitLimit: cfg.rateLimitLimit || '', rateLimitWindow: cfg.rateLimitWindow || '', corsEnabled: cfg.corsEnabled !== false, allowedOrigins: cfg.allowedOrigins || '*' });
      else setConfig({ requireJwt: false, requireApiKey: false, apiKeyValue: '', rateLimitLimit: '', rateLimitWindow: '', corsEnabled: true, allowedOrigins: '*' });
    }).finally(() => setLoading(false));
  }, [selectedWfId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.workflows.updateGatewayConfig(selectedWfId, { ...config, rateLimitLimit: config.rateLimitLimit ? parseInt(config.rateLimitLimit) : null, rateLimitWindow: config.rateLimitWindow ? parseInt(config.rateLimitWindow) : null });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };

  const Toggle = ({ label, sub, field }: any) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--mono)' }}>[ {label.toUpperCase().replace(/ /g, '_')} ]</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--mono)' }}>{sub.toUpperCase()}</div>}
      </div>
      <button onClick={() => setConfig((p: any) => ({ ...p, [field]: !p[field] }))}
        style={{
          padding: '6px 16px',
          border: `1.5px solid ${config[field] ? 'var(--neon-cyan)' : 'var(--border-strong)'}`,
          background: config[field] ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255,255,255,0.02)',
          color: config[field] ? 'var(--neon-cyan)' : 'var(--text-muted)',
          cursor: 'pointer',
          fontFamily: 'var(--mono)',
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: '0.08em',
          transition: 'all 0.2s',
          boxShadow: config[field] ? '0 0 12px rgba(0, 242, 254, 0.15)' : 'none'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = config[field] ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255,255,255,0.06)';
          e.currentTarget.style.boxShadow = config[field] ? '0 0 15px rgba(0, 242, 254, 0.3)' : 'none';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = config[field] ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255,255,255,0.02)';
          e.currentTarget.style.boxShadow = config[field] ? '0 0 12px rgba(0, 242, 254, 0.15)' : 'none';
        }}
      >
        {config[field] ? 'ACTIVE //' : 'DISABLED //'}
      </button>
    </div>
  );

  const selectedWf = workflows.find(w => w.id === selectedWfId);

  return (
    <div style={{ height: 'calc(100vh - 104px)', overflowY: 'auto', background: 'var(--bg-base)', fontFamily: 'Inter, sans-serif' }}>
      {/* Visual Header */}
      <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(0, 242, 254, 0.15)', background: 'rgba(10,15,30,0.6)', backdropFilter: 'blur(20px)', position: 'relative', animation: 'fadeIn 0.35s ease both' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'var(--grad-brand)' }} />
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.3px', fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>🛡️ API Gateway Configuration</h1>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Configure security controls, rate limiting, and CORS headers per endpoint.</p>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.5s ease both' }}>
        
        {/* Workflow selector capsule */}
        <div className="cyber-plate-cyan tech-corners" style={{ padding: '20px 24px' }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: 'var(--mono)' }}>[ ACTIVE_ENDPOINT_WORKFLOW ]</label>
          <select value={selectedWfId} onChange={e => setSelectedWfId(e.target.value)} 
            style={{ width: '100%', background: 'rgba(2, 6, 23, 0.95)', border: '1px solid rgba(0, 242, 254, 0.3)', padding: '11px 14px', color: '#f1f5f9', fontSize: 13, outline: 'none', transition: 'border-color 0.2s', cursor: 'pointer', fontFamily: 'var(--mono)' }}>
            {workflows.map(wf => <option key={wf.id} value={wf.id}>{wf.method} {wf.path} — {wf.name} {wf.isPublished ? '● LIVE' : ''}</option>)}
          </select>
          {selectedWf && (
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <span className={selectedWf.isPublished ? 'badge badge-success' : 'badge badge-accent'} style={{ fontSize: 10 }}>
                {selectedWf.isPublished ? 'Published' : 'Draft'}
              </span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 10 }}>ID: {selectedWf.id.slice(0,8)}...</span>
            </div>
          )}
        </div>

        {loading ? <div className="skeleton" style={{ height: 320, borderRadius: 0 }} /> : (
          <>
            {/* Auth section */}
            <div className="cyber-plate-fuchsia tech-corners" style={{ padding: '24px 28px' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--neon-fuchsia)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--mono)' }}>[ AUTHENTICATION_CONTROLS ]</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Require credentials to invoke this API endpoint.</div>
              <Toggle label="Require JWT Bearer Token" sub="Verify Authorization: Bearer <JWT> token on requests" field="requireJwt" />
              <Toggle label="Require API Key" sub="Verify custom x-api-key header credentials" field="requireApiKey" />
              
              {config.requireApiKey && (
                <div style={{ marginTop: 18, animation: 'fadeInFast 0.2s ease', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label className="label" style={{ color: 'var(--neon-fuchsia)' }}>[ SECURE_API_KEY_VALUE ]</label>
                  <div style={{
                    position: 'relative',
                    background: 'rgba(2, 6, 23, 0.95)',
                    border: '1px solid rgba(243, 85, 218, 0.25)',
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
                    e.currentTarget.style.borderColor = 'rgba(243, 85, 218, 0.25)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <span style={{ color: 'var(--neon-fuchsia)', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 'bold' }}>{'>'}</span>
                    <input type="password" value={config.apiKeyValue} onChange={e => setConfig((p: any) => ({ ...p, apiKeyValue: e.target.value }))} placeholder="••••••••••••••••••••••••••••••••"
                      style={{ width: '100%', background: 'transparent', border: 'none', color: '#f1f5f9', fontSize: 13, outline: 'none', fontFamily: 'var(--mono)' }} />
                  </div>
                  <div style={{ marginTop: 4, fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
                    🔑 Leaving it blank will retain the previously saved secure API key.
                  </div>
                </div>
              )}
            </div>

            {/* Rate limiting */}
            <div className="cyber-plate-cyan tech-corners" style={{ padding: '24px 28px' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--neon-cyan)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--mono)' }}>[ RATE_LIMITING_LIMITS ]</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18 }}>Throttle request volume per client IP to prevent abuse.</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {[{ label: 'Max Requests', key: 'rateLimitLimit', placeholder: 'e.g. 100' }, { label: 'Window (seconds)', key: 'rateLimitWindow', placeholder: 'e.g. 60' }].map(f => (
                  <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label className="label" style={{ color: 'var(--neon-cyan)' }}>{f.label}</label>
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
                      <input type="number" value={config[f.key]} onChange={e => setConfig((p: any) => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                        style={{ width: '100%', background: 'transparent', border: 'none', color: '#f1f5f9', fontSize: 13, outline: 'none', fontFamily: 'var(--mono)' }} />
                    </div>
                  </div>
                ))}
              </div>
              {config.rateLimitLimit && config.rateLimitWindow && (
                <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 0, background: 'rgba(0, 242, 254, 0.05)', border: '1px solid rgba(0, 242, 254, 0.2)', fontSize: 11, color: 'var(--accent-light)', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--mono)' }}>
                  <span>ℹ️ Endpoint configured for {config.rateLimitLimit} requests every {config.rateLimitWindow} seconds per IP.</span>
                </div>
              )}
            </div>

            {/* CORS */}
            <div className="cyber-plate-emerald tech-corners" style={{ padding: '24px 28px' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--neon-emerald)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--mono)' }}>[ CROSS_ORIGIN_RESOURCE_POLICIES ]</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18 }}>Manage which web applications are permitted to call this endpoint.</div>
              <Toggle label="Enable CORS headers" sub="Authorize cross-origin requests & preflight prechecks" field="corsEnabled" />
              {config.corsEnabled && (
                <div style={{ marginTop: 18, animation: 'fadeInFast 0.2s ease', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label className="label" style={{ color: 'var(--neon-emerald)' }}>Allowed Origins</label>
                  <div style={{
                    position: 'relative',
                    background: 'rgba(2, 6, 23, 0.95)',
                    border: '1px solid rgba(5, 255, 196, 0.25)',
                    padding: '12px 14px',
                    transition: 'all 0.25s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}
                  onFocusCapture={e => {
                    e.currentTarget.style.borderColor = 'var(--neon-emerald)';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(5, 255, 196, 0.25)';
                  }}
                  onBlurCapture={e => {
                    e.currentTarget.style.borderColor = 'rgba(5, 255, 196, 0.25)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <span style={{ color: 'var(--neon-emerald)', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 'bold' }}>{'>'}</span>
                    <input value={config.allowedOrigins} onChange={e => setConfig((p: any) => ({ ...p, allowedOrigins: e.target.value }))} placeholder="* or https://my-client-app.com"
                      style={{ width: '100%', background: 'transparent', border: 'none', color: '#f1f5f9', fontSize: 13, outline: 'none', fontFamily: 'var(--mono)' }} />
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleSave} disabled={saving || !selectedWfId}
              style={{
                padding: '14px',
                background: saving ? 'rgba(30, 41, 59, 0.5)' : saved ? 'rgba(16,185,129,0.1)' : 'rgba(0, 242, 254, 0.08)',
                color: saving ? 'var(--text-muted)' : saved ? 'var(--success)' : 'var(--neon-cyan)',
                border: `1.5px solid ${saved ? 'var(--success)' : 'var(--neon-cyan)'}`,
                fontFamily: 'var(--mono)',
                fontSize: 13,
                fontWeight: 800,
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.25s',
                boxShadow: '0 0 10px rgba(0, 242, 254, 0.1)',
                letterSpacing: '0.05em'
              }}
              onMouseEnter={e => { if (!saving) { e.currentTarget.style.background = saved ? 'rgba(16,185,129,0.15)' : 'rgba(0, 242, 254, 0.2)'; e.currentTarget.style.boxShadow = `0 0 20px ${saved ? 'rgba(16,185,129,0.4)' : 'rgba(0, 242, 254, 0.4)'}`; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
              onMouseLeave={e => { e.currentTarget.style.background = saving ? 'rgba(30, 41, 59, 0.5)' : saved ? 'rgba(16,185,129,0.1)' : 'rgba(0, 242, 254, 0.08)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 242, 254, 0.1)'; e.currentTarget.style.transform = 'none'; }}
            >
              {saving ? <><span className="spinner" /> COMMITTING CONFIGURATION...</> : saved ? '✓ GATEWAY CONFIGURATION COMMITTED SUCCESS' : 'SAVE GATEWAY GATEWAYS CONFIG //'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
