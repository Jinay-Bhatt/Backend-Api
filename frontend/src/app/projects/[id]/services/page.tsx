'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { api } from '../../../../services/api';

const ServiceNode = ({ data }: any) => {
  const { name, baseUrl, isActive, routesCount } = data;
  const statusColor = isActive ? '#05ffc4' : '#64748b';
  const glowShadow = isActive ? '0 0 15px rgba(5, 255, 196, 0.6)' : 'none';
  
  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      {/* Target Handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: isActive ? '#00f2fe' : '#334155',
          border: `1.5px solid ${isActive ? '#05ffc4' : '#475569'}`,
          boxShadow: isActive ? '0 0 8px #00f2fe' : 'none',
          left: -4,
        }}
      />
      
      {/* Planetary Orbit Ring */}
      <div style={{
        position: 'absolute',
        width: 86,
        height: 86,
        borderRadius: '50%',
        border: `1px dashed ${isActive ? 'rgba(5, 255, 196, 0.3)' : 'rgba(100, 116, 139, 0.15)'}`,
        animation: isActive ? 'spin 12s linear infinite' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        {/* Orbiting particle */}
        {isActive && (
          <div style={{
            position: 'absolute',
            top: -3,
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#05ffc4',
            boxShadow: '0 0 8px #05ffc4',
          }} />
        )}
      </div>

      {/* Outer Pulse/Glow Ring */}
      <div style={{
        position: 'absolute',
        width: 68,
        height: 68,
        borderRadius: '50%',
        border: `1.5px solid ${isActive ? 'rgba(0, 242, 254, 0.4)' : 'rgba(51, 65, 85, 0.3)'}`,
        boxShadow: isActive ? '0 0 12px rgba(0, 242, 254, 0.2)' : 'none',
        animation: isActive ? 'floatSlow 4s ease-in-out infinite' : 'none',
        pointerEvents: 'none',
      }} />

      {/* Planetary Server Core */}
      <div style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${isActive ? '#0a1f30' : '#0f172a'} 0%, #020617 100%)`,
        border: `2px solid ${statusColor}`,
        boxShadow: glowShadow,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        cursor: 'pointer',
      }}>
        <div style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: statusColor,
          boxShadow: glowShadow,
          animation: isActive ? 'pulse 2s infinite' : 'none',
        }} />
      </div>

      {/* Telemetry/HUD Slate below core */}
      <div style={{
        marginTop: 12,
        padding: '8px 12px',
        minWidth: 150,
        textAlign: 'center',
        zIndex: 3,
        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)',
        background: 'rgba(5, 10, 20, 0.85)',
        border: `1.5px solid ${isActive ? '#00f2fe' : '#334155'}`,
        boxShadow: isActive ? '0 0 15px rgba(0, 242, 254, 0.15)' : 'none',
        color: '#f1f5f9',
      }}>
        <div style={{
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: isActive ? '#00f2fe' : '#94a3b8',
          fontSize: 11,
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          {name}
        </div>
        <div style={{
          fontSize: 9,
          color: '#64748b',
          fontFamily: "'JetBrains Mono', monospace",
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginTop: 2
        }}>
          {baseUrl}
        </div>
        {routesCount > 0 && (
          <div style={{
            fontSize: 8,
            color: '#05ffc4',
            marginTop: 4,
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: 4,
            fontFamily: "'JetBrains Mono', monospace"
          }}>
            NODE ACTIVE · {routesCount} PATHS
          </div>
        )}
      </div>

      {/* Source Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: isActive ? '#00f2fe' : '#334155',
          border: `1.5px solid ${isActive ? '#05ffc4' : '#475569'}`,
          boxShadow: isActive ? '0 0 8px #00f2fe' : 'none',
          right: -4,
        }}
      />
    </div>
  );
};

const nodeTypes = {
  serviceNode: ServiceNode
};

export default function ServicesPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', baseUrl: '', description: '' });
  const [adding, setAdding] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isMinimapVisible, setIsMinimapVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastZoomRef = useRef<number | null>(null);

  const onMove = useCallback((_event: any, viewport: any) => {
    const currentZoom = viewport.zoom;
    if (lastZoomRef.current !== null && lastZoomRef.current !== currentZoom) {
      setIsMinimapVisible(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setIsMinimapVisible(false);
      }, 1500);
    }
    lastZoomRef.current = currentZoom;
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => { if (projectId) loadServices(); }, [projectId]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const list = await api.services.list(projectId);
      setServices(list);
      buildGraph(list);
    } finally { setLoading(false); }
  };

  const buildGraph = (serviceList: any[]) => {
    const centerX = 400, centerY = 280, radius = 200;
    const newNodes: Node[] = serviceList.map((svc, i) => {
      const angle = (i / Math.max(serviceList.length, 1)) * 2 * Math.PI - Math.PI / 2;
      const x = serviceList.length === 1 ? centerX - 80 : centerX + radius * Math.cos(angle) - 80;
      const y = serviceList.length === 1 ? centerY - 40 : centerY + radius * Math.sin(angle) - 40;
      return {
        id: svc.id,
        type: 'serviceNode',
        position: { x, y },
        data: {
          name: svc.name,
          baseUrl: svc.baseUrl,
          isActive: svc.isActive,
          routesCount: svc.routes?.length || 0,
        },
      };
    });

    const newEdges: Edge[] = [];
    serviceList.forEach(svc => {
      (svc.routes || []).forEach((route: any, j: number) => {
        const target = serviceList.find((s: any) =>
          s.name === route.targetService || s.baseUrl.includes(route.targetService)
        );
        if (target && target.id !== svc.id) {
          newEdges.push({
            id: `e-${svc.id}-${target.id}-${j}`,
            source: svc.id,
            target: target.id,
            animated: true,
            label: `${route.method} ${route.path}`,
            style: { stroke: svc.isActive && target.isActive ? '#05ffc4' : '#334155', strokeWidth: 2 },
            labelStyle: { fill: '#64748b', fontSize: 9, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 },
            markerEnd: { type: MarkerType.ArrowClosed, color: svc.isActive && target.isActive ? '#05ffc4' : '#334155' },
          });
        }
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await api.services.create(projectId, form);
      await loadServices();
      setShowAdd(false);
      setForm({ name: '', baseUrl: '', description: '' });
    } catch (err: any) { alert(err.message); }
    finally { setAdding(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete service "${name}"?`)) return;
    await api.services.delete(projectId, id);
    await loadServices();
  };

  const handleToggleActive = async (svc: any) => {
    await api.services.update(projectId, svc.id, { isActive: !svc.isActive });
    await loadServices();
  };

  return (
    <div style={{ height: 'calc(100vh - 104px)', display: 'flex', background: 'var(--bg-base)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ── LEFT PANEL ─────────────────────────────── */}
      <div style={{ width: 340, borderRight: '1px solid rgba(0, 242, 254, 0.2)', display: 'flex', flexDirection: 'column', background: 'rgba(10,15,30,0.85)', backdropFilter: 'blur(20px)', flexShrink: 0, animation: 'fadeIn 0.35s ease both' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0, 242, 254, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', letterSpacing: '0.03em' }}>🔗 CORE SERVICES</div>
            <div style={{ fontSize: 11, color: '#00f2fe', fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{services.length} ACTIVE NAMESPACES</div>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="btn"
            style={{
              padding: '6px 12px',
              background: 'transparent',
              border: '1px solid #00f2fe',
              color: '#00f2fe',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontFamily: "'JetBrains Mono', monospace",
              boxShadow: '0 0 10px rgba(0, 242, 254, 0.2)',
              clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
            }}
          >+ Register</button>
        </div>

        <div className="scroll-area" style={{ flex: 1, padding: '16px' }}>
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 110, borderRadius: 14, marginBottom: 12 }} />
            ))
          ) : services.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 16px', color: 'var(--text-faint)' }}>
              <div style={{ fontSize: 40, marginBottom: 12, animation: 'float 3s infinite' }}>🕸️</div>
              <p style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>NO MESH NAMESPACES DETECTED.</p>
            </div>
          ) : services.map((svc, idx) => {
            const isSvcActive = svc.isActive;
            const cyberClass = isSvcActive ? 'cyber-plate-cyan' : 'cyber-plate-fuchsia';
            const borderCol = isSvcActive ? 'rgba(0, 242, 254, 0.3)' : 'rgba(243, 85, 218, 0.3)';
            const glowText = isSvcActive ? '#00f2fe' : '#f355da';

            return (
              <div key={svc.id} className={cyberClass}
                style={{
                  padding: 16,
                  marginBottom: 14,
                  border: `1.5px solid ${borderCol}`,
                  background: 'rgba(5, 10, 20, 0.6)',
                  animation: `fadeIn 0.3s ease ${idx * 0.05}s both`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: isSvcActive ? '#05ffc4' : '#64748b',
                      boxShadow: isSvcActive ? '0 0 10px #05ffc4' : 'none',
                      animation: isSvcActive ? 'pulseGlow 2s infinite' : 'none'
                    }} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9', letterSpacing: '0.02em' }}>{svc.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, zIndex: 10 }}>
                    <button onClick={() => handleToggleActive(svc)} title={isSvcActive ? 'Pause service' : 'Activate service'}
                      style={{
                        width: 24,
                        height: 24,
                        border: `1px solid ${borderCol}`,
                        background: 'transparent',
                        color: isSvcActive ? '#05ffc4' : '#64748b',
                        cursor: 'pointer',
                        fontSize: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'monospace',
                      }}
                    >{isSvcActive ? '⏸' : '▶'}</button>
                    <button onClick={() => handleDelete(svc.id, svc.name)}
                      style={{
                        width: 24,
                        height: 24,
                        border: `1px solid rgba(239, 68, 68, 0.2)`,
                        background: 'transparent',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: 11,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >🗑</button>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: glowText, fontFamily: "'JetBrains Mono', monospace", marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{svc.baseUrl}</div>
                {svc.description && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{svc.description}</div>}
                
                {(svc.routes?.length > 0) && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed rgba(255,255,255,0.08)' }}>
                    {svc.routes.slice(0, 3).map((r: any, i: number) => (
                      <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 5 }}>
                        <span className={`method-${r.method}`} style={{ fontSize: 8, padding: '1px 4px', borderRadius: 3 }}>{r.method}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{r.path}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SERVICE MESH GRAPH ─────────────────────── */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 10,
          padding: '8px 16px',
          background: 'rgba(10,15,30,0.9)',
          border: '1px solid rgba(0, 242, 254, 0.3)',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: '#00f2fe',
          boxShadow: '0 0 15px rgba(0, 242, 254, 0.1)',
          clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)'
        }}>
          📡 MESH GRAPH CONTROL · {services.length} NODES · {edges.length} GLOW VECTORS
        </div>

        {services.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-faint)', gap: 12 }}>
            <div style={{ fontSize: 64, animation: 'floatSlow 4s infinite' }}>🕸️</div>
            <p style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>SERVICE NETWORK OFFLINE</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Register nodes in the command telemetry panel to initiate graph link diagnostics.</p>
            <button onClick={() => setShowAdd(true)}
              style={{
                marginTop: 12,
                padding: '8px 16px',
                background: 'transparent',
                border: '1.5px solid #05ffc4',
                color: '#05ffc4',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace",
                textTransform: 'uppercase',
                boxShadow: '0 0 15px rgba(5, 255, 196, 0.2)',
                clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
              }}
            >+ Add First Service</button>
          </div>
        ) : (
          <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onMove={onMove} fitView style={{ background: 'var(--bg-base)' }}>
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(0, 242, 254, 0.1)" />
            <Controls style={{ background: '#0a0f1e', border: '1px solid rgba(0, 242, 254, 0.25)', borderRadius: 0, boxShadow: '0 0 10px rgba(0, 242, 254, 0.15)' }} />
            <MiniMap style={{
              background: '#020617',
              border: '1px solid rgba(0, 242, 254, 0.25)',
              borderRadius: 0,
              opacity: isMinimapVisible ? 1 : 0,
              pointerEvents: isMinimapVisible ? 'all' : 'none',
              transition: 'opacity 0.3s ease-in-out',
            }} nodeColor={(n) => n.data?.isActive ? '#05ffc4' : '#64748b'} maskColor="rgba(2,6,23,0.85)" />
          </ReactFlow>
        )}
      </div>

      {/* ── REGISTER SERVICE MODAL ─────────────────────── */}
      {showAdd && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}>
          <div className="cyber-plate-cyan tech-corners" style={{ maxWidth: 460, width: '100%', padding: 28, background: '#0a0f1e', border: '2.5px solid #00f2fe', clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 38, height: 38, border: '1px solid #00f2fe', background: 'rgba(0, 242, 254, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 0 10px rgba(0,242,254,0.2)' }}>🔗</div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 900, letterSpacing: '0.04em', color: '#fff', textTransform: 'uppercase' }}>REGISTER NODE</h2>
                <p style={{ fontSize: 11, color: '#00f2fe', fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>ESTABLISHING NEW MESH NAMESPACE</p>
              </div>
              <button onClick={() => setShowAdd(false)} style={{ marginLeft: 'auto', width: 28, height: 28, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >✕</button>
            </div>
            
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                { k: 'name', label: 'Service Namespace Key', placeholder: 'auth-service', type: 'text' },
                { k: 'baseUrl', label: 'Target Base URL', placeholder: 'https://auth.api.mycompany.com', type: 'text' },
                { k: 'description', label: 'Service Description', placeholder: 'Handles profile security tokens', type: 'text' },
              ].map(f => (
                <div key={f.k}>
                  <label className="label" style={{ color: '#00f2fe', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.05em' }}>{f.label}</label>
                  <input
                    type={f.type} value={(form as any)[f.k]}
                    onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                    placeholder={f.placeholder}
                    required={f.k !== 'description'}
                    className="input"
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1.5px solid rgba(0, 242, 254, 0.25)',
                      borderRadius: 0,
                      color: '#fff',
                      fontSize: 12,
                      fontFamily: f.k === 'description' ? 'inherit' : "'JetBrains Mono', monospace",
                    }}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowAdd(false)} className="btn btn-ghost" style={{ flex: 1, borderRadius: 0, border: '1px solid rgba(255,255,255,0.15)' }}>Cancel</button>
                <button type="submit" disabled={adding} className="btn"
                  style={{
                    flex: 2,
                    background: 'rgba(0, 242, 254, 0.15)',
                    border: '1.5px solid #00f2fe',
                    color: '#00f2fe',
                    borderRadius: 0,
                    boxShadow: '0 0 15px rgba(0, 242, 254, 0.2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700
                  }}
                >
                  {adding ? 'Registering...' : '🔗 Register Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

