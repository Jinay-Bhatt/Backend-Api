'use client';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState,
  addEdge, Panel, MarkerType, Connection, Edge, Node, BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { io, Socket } from 'socket.io-client';
import { api, BASE_URL_DIRECT } from '../../../../services/api';
import { nodeTypes, NODE_PALETTE } from '../../../../components/customNodes';

const METHOD_COLORS: Record<string, string> = { GET: '#10b981', POST: '#6366f1', PUT: '#f59e0b', DELETE: '#ef4444', PATCH: '#38bdf8' };

export default function BuilderPage() {
  const params = useParams();
  const projectId = params?.id as string;

  // Workflows
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedWf, setSelectedWf] = useState<any>(null);
  const [wfLoading, setWfLoading] = useState(false);
  const [showCreateWf, setShowCreateWf] = useState(false);
  const [newWf, setNewWf] = useState({ name: '', path: '/', method: 'GET' });
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Canvas
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // AI
  const [showAi, setShowAi] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Metrics
  const [logs, setLogs] = useState<any[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!projectId) return;
    loadWorkflows();
    const socket = io(BASE_URL_DIRECT);
    socketRef.current = socket;
    socket.on('connect', () => socket.emit('join-project', projectId));
    socket.on('metrics', (m: any) => setLogs(p => [m, ...p].slice(0, 50)));
    return () => { socket.disconnect(); };
  }, [projectId]);

  const loadWorkflows = async () => {
    setWfLoading(true);
    try {
      const list = await api.workflows.list(projectId);
      setWorkflows(list);
      if (list.length > 0) loadWorkflowDetail(list[0]);
    } finally { setWfLoading(false); }
  };

  const loadWorkflowDetail = async (wf: any) => {
    setSelectedWf(wf);
    const full = await api.workflows.get(wf.id);
    setNodes((full.nodes as Node[]) || []);
    setEdges((full.edges as Edge[]) || []);
    setSelectedNodeId(null);
  };

  const handleCreateWf = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.workflows.create(projectId, newWf);
      setWorkflows(p => [created, ...p]);
      loadWorkflowDetail(created);
      setShowCreateWf(false);
      setNewWf({ name: '', path: '/', method: 'GET' });
    } catch (err: any) { alert(err.message); }
  };

  const handleSave = async () => {
    if (!selectedWf) return;
    setSaving(true);
    try {
      const triggerNode = nodes.find(n => n.type === 'triggerNode');
      await api.workflows.update(selectedWf.id, {
        nodes, edges,
        method: triggerNode?.data?.method || selectedWf.method,
        path: triggerNode?.data?.path || selectedWf.path,
      });
      const list = await api.workflows.list(projectId);
      setWorkflows(list);
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handlePublish = async () => {
    if (!selectedWf) return;
    setPublishing(true);
    try {
      const next = !selectedWf.isPublished;
      await api.workflows.publish(selectedWf.id, next);
      setSelectedWf((p: any) => ({ ...p, isPublished: next }));
      setWorkflows(wfs => wfs.map(w => w.id === selectedWf.id ? { ...w, isPublished: next } : w));
    } catch (err: any) { alert(err.message); }
    finally { setPublishing(false); }
  };

  const handleDeleteWf = async () => {
    if (!selectedWf || !confirm(`Delete "${selectedWf.name}"?`)) return;
    await api.workflows.delete(selectedWf.id);
    const list = await api.workflows.list(projectId);
    setWorkflows(list);
    if (list.length > 0) loadWorkflowDetail(list[0]);
    else { setSelectedWf(null); setNodes([]); setEdges([]); }
  };

  const onConnect = useCallback((params: Connection) =>
    setEdges(eds => addEdge({
      ...params,
      animated: true,
      style: { stroke: '#00f2fe', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#00f2fe' }
    }, eds)), []);

  const addNode = (type: string, defaultData: any) => {
    if (!selectedWf) { alert('Select or create a workflow first'); return; }
    if (type === 'triggerNode' && nodes.some(n => n.type === 'triggerNode')) {
      alert('Only one trigger node per workflow'); return;
    }
    const id = `node_${Date.now()}`;
    const newNode: Node = { id, type, position: { x: 120 + nodes.length * 60, y: 180 + (nodes.length % 3) * 80 }, data: { ...defaultData } };
    setNodes(ns => [...ns, newNode]);
    setSelectedNodeId(id);
  };

  const deleteNode = () => {
    if (!selectedNodeId) return;
    setNodes(ns => ns.filter(n => n.id !== selectedNodeId));
    setEdges(es => es.filter(e => e.source !== selectedNodeId && e.target !== selectedNodeId));
    setSelectedNodeId(null);
  };

  const handleNodeDataChange = (key: string, value: any) => {
    if (!selectedNodeId) return;
    setNodes(ns => ns.map(n => n.id === selectedNodeId ? { ...n, data: { ...n.data, [key]: value } } : n));
  };

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);

  // AI Generator
  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError('');
    try {
      const res = await api.ai.generateWorkflow(aiPrompt);
      const { workflow } = res;
      const created = await api.workflows.create(projectId, {
        name: workflow.name,
        path: workflow.path,
        method: workflow.method,
        nodes: workflow.nodes,
        edges: workflow.edges
      });
      setNodes((workflow.nodes as Node[]) || []);
      setEdges((workflow.edges as Edge[]) || []);
      setSelectedWf(created);
      setWorkflows(p => [created, ...p]);
      setShowAi(false);
      setAiPrompt('');
    } catch (err: any) { setAiError(err.message); }
    finally { setAiLoading(false); }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 100px)', background: 'var(--bg-base)', fontFamily: "'Plus Jakarta Sans', sans-serif", overflow: 'hidden' }}>

      {/* ── LEFT SIDEBAR ─────────────────────────────── */}
      <div style={{ width: 260, background: 'rgba(10, 15, 30, 0.9)', borderRight: '1.5px solid rgba(0, 242, 254, 0.2)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden', backdropFilter: 'blur(20px)' }}>
        {/* Workflows panel */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px dashed rgba(0, 242, 254, 0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#00f2fe', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>💻 ACTIVE ROUTES</span>
            <button onClick={() => setShowCreateWf(true)}
              style={{
                width: 22,
                height: 22,
                border: '1px solid #00f2fe',
                background: 'rgba(0, 242, 254, 0.05)',
                color: '#00f2fe',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(0,242,254,0.15)'
              }}>+</button>
          </div>
          <div className="scroll-area" style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
            {wfLoading ? <div style={{ height: 32, borderRadius: 0 }} className="skeleton" /> :
              workflows.map(wf => (
                <button key={wf.id} onClick={() => loadWorkflowDetail(wf)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    border: `1px solid ${selectedWf?.id === wf.id ? '#00f2fe' : 'rgba(255,255,255,0.04)'}`,
                    background: selectedWf?.id === wf.id ? 'rgba(0, 242, 254, 0.08)' : 'rgba(5,10,20,0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s',
                    clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
                    boxShadow: selectedWf?.id === wf.id ? '0 0 10px rgba(0, 242, 254, 0.15)' : 'none',
                  }}>
                  <span style={{ fontSize: 8, fontWeight: 900, color: METHOD_COLORS[wf.method] || '#6366f1', background: `${METHOD_COLORS[wf.method]}18`, border: `1px solid ${METHOD_COLORS[wf.method]}30`, borderRadius: 3, padding: '1px 4px', fontFamily: "'JetBrains Mono', monospace" }}>{wf.method}</span>
                  <span style={{ fontSize: 11, color: selectedWf?.id === wf.id ? '#00f2fe' : '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'JetBrains Mono', monospace", fontWeight: selectedWf?.id === wf.id ? 700 : 400 }}>{wf.name}</span>
                  {wf.isPublished && (
                    <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#05ffc4', boxShadow: '0 0 6px #05ffc4', flexShrink: 0 }} />
                  )}
                </button>
              ))}
          </div>
        </div>

        {/* Node Palette */}
        <div className="scroll-area" style={{ flex: 1, padding: '12px 16px' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', marginBottom: 12 }}>🛠️ NODE TELEMETRY</div>
          {NODE_PALETTE.map(cat => (
            <div key={cat.category} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: cat.color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em', marginBottom: 6 }}>{cat.category.toUpperCase()}</div>
              {cat.nodes.map(n => (
                <button key={n.type} onClick={() => addNode(n.type, n.defaultData)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    background: 'rgba(5, 10, 20, 0.4)',
                    border: '1.5px solid rgba(255, 255, 255, 0.05)',
                    clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 5,
                    transition: 'all 0.2s',
                    color: '#94a3b8',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = cat.color + '50';
                    e.currentTarget.style.background = cat.color + '0a';
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.boxShadow = `inset 0 0 10px ${cat.color}15`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.background = 'rgba(5, 10, 20, 0.4)';
                    e.currentTarget.style.color = '#94a3b8';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                  <span style={{ fontSize: 14 }}>{n.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 11, fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#e2e8f0' }}>{n.label}</div>
                    <div style={{ fontSize: 9, color: '#64748b', marginTop: 2, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{n.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── CANVAS ───────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Toolbar */}
        <div style={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(5, 10, 20, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(0, 242, 254, 0.3)',
          boxShadow: '0 0 25px rgba(0, 242, 254, 0.15)',
          clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
          padding: '6px 16px'
        }}>
          {selectedWf ? (
            <>
              <span style={{ fontSize: 11, color: '#00f2fe', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedWf.name.toUpperCase()}</span>
              <div style={{ width: 1.5, height: 16, background: 'rgba(0, 242, 254, 0.2)' }} />
              
              {/* Save Button */}
              <button onClick={handleSave} disabled={saving}
                style={{
                  padding: '5px 12px',
                  background: 'transparent',
                  border: '1px solid rgba(0, 242, 254, 0.25)',
                  color: saving ? '#475569' : '#00f2fe',
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)'
                }}>
                {saving ? '⟳' : '💾'} {saving ? 'SAVING...' : 'SAVE'}
              </button>

              <button onClick={handlePublish} disabled={publishing}
                style={{
                  padding: '5px 12px',
                  background: selectedWf?.isPublished ? 'rgba(239,68,68,0.15)' : 'linear-gradient(135deg,#00f2fe,#8b5cf6)',
                  border: selectedWf?.isPublished ? '1px solid #ef4444' : 'none',
                  color: selectedWf?.isPublished ? '#fca5a5' : '#fff',
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 900,
                  cursor: publishing ? 'not-allowed' : 'pointer',
                  clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
                  boxShadow: selectedWf?.isPublished ? 'none' : '0 0 12px rgba(0, 242, 254, 0.2)'
                }}>
                {publishing ? '...' : selectedWf?.isPublished ? '⏸ SUSPEND' : '🚀 INITIALIZE'}
              </button>

              {selectedWf?.isPublished && (
                <div style={{
                  padding: '3px 8px',
                  background: 'rgba(5, 255, 196, 0.1)',
                  border: '1.5px solid #05ffc4',
                  fontSize: 9,
                  color: '#05ffc4',
                  fontWeight: 900,
                  fontFamily: "'JetBrains Mono', monospace",
                  boxShadow: '0 0 8px rgba(5,255,196,0.2)',
                  animation: 'pulseGlow 2s infinite'
                }}>● LIVE MODE</div>
              )}
              <button onClick={handleDeleteWf} style={{ padding: '5px 8px', border: 'none', background: 'transparent', color: '#475569', fontSize: 12, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.color = '#ef4444'} onMouseLeave={e => e.currentTarget.style.color = '#475569'}>🗑</button>
            </>
          ) : (
            <span style={{ fontSize: 11, color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>← SELECT OR GENERATE WORKFLOW</span>
          )}
          <div style={{ width: 1.5, height: 16, background: 'rgba(0, 242, 254, 0.2)' }} />
          
          {/* AI Button */}
          <button onClick={() => setShowAi(true)}
            style={{
              padding: '5px 12px',
              border: '1.5px solid #f355da',
              background: 'rgba(243, 85, 218, 0.1)',
              color: '#f355da',
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
              boxShadow: '0 0 10px rgba(243, 85, 218, 0.15)'
            }}>
            ✨ AI SYNTHESIZE
          </button>
        </div>

        <ReactFlow
          nodes={nodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
          onPaneClick={() => setSelectedNodeId(null)}
          fitView
          style={{ background: 'var(--bg-base)' }}
          defaultEdgeOptions={{ animated: true, style: { stroke: '#00f2fe', strokeWidth: 2 } }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(0, 242, 254, 0.08)" />
          <Controls style={{ background: '#0a0f1e', border: '1px solid rgba(0, 242, 254, 0.25)', borderRadius: 0, boxShadow: '0 0 10px rgba(0, 242, 254, 0.15)' }} />
          <MiniMap style={{ background: '#020617', border: '1px solid rgba(0, 242, 254, 0.25)', borderRadius: 0 }} nodeColor={() => '#00f2fe'} maskColor="rgba(2,6,23,0.85)" />
          {nodes.length === 0 && (
            <Panel position="top-center">
              <div style={{ marginTop: 100, textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: 44, marginBottom: 8, animation: 'float 3s infinite' }}>⚡</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>DEPLOY NODES FROM PALETTE OR SYNTHESIZE VIA GEMINI AI</div>
              </div>
            </Panel>
          )}
        </ReactFlow>

        {/* Live metrics strip (HUD style bottom feed) */}
        {logs.length > 0 && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(5, 10, 20, 0.95)',
            borderTop: '1.5px solid rgba(0, 242, 254, 0.2)',
            padding: '8px 16px',
            display: 'flex',
            gap: 16,
            overflowX: 'auto',
            fontSize: 9,
            color: '#94a3b8',
            fontFamily: "'JetBrains Mono', monospace",
            zIndex: 5
          }}>
            <div style={{ color: '#00f2fe', fontWeight: 900, borderRight: '1.5px solid rgba(0,242,254,0.3)', paddingRight: 10 }}>TELEMETRY STREAM:</div>
            {logs.slice(0, 5).map((l, i) => (
              <span key={i} style={{ flexShrink: 0, color: l.responseStatus >= 400 ? '#ef4444' : '#05ffc4' }}>
                [{l.method}] {l.path} → CODE {l.responseStatus} ({l.latencyMs}ms)
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── RIGHT CONFIG PANEL ────────────────────────── */}
      {selectedNode && (
        <div style={{ width: 300, background: 'rgba(10, 15, 30, 0.9)', borderLeft: '1.5px solid rgba(0, 242, 254, 0.2)', overflowY: 'auto', flexShrink: 0, backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px dashed rgba(0, 242, 254, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 900, color: '#00f2fe', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>⚙️ NODE CONFIG</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={deleteNode} style={{ padding: '4px 8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace" }}>DELETE</button>
              <button onClick={() => setSelectedNodeId(null)} style={{ width: 22, height: 22, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 10 }}>✕</button>
            </div>
          </div>
          <div className="scroll-area" style={{ padding: 20, flex: 1 }}>
            <NodeConfigPanel node={selectedNode} onChange={handleNodeDataChange} />
          </div>
        </div>
      )}

      {/* ── CREATE WORKFLOW MODAL ─────────────────────── */}
      {showCreateWf && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.9)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div className="cyber-plate-cyan tech-corners" style={{ background: '#0a0f1e', border: '2.5px solid #00f2fe', clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))', padding: 32, width: '100%', maxWidth: 420 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CREATE WORKFLOW</h2>
              <button onClick={() => setShowCreateWf(false)} style={{ width: 26, height: 26, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleCreateWf} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[{ k: 'name', label: 'Name Namespace Key', placeholder: 'Get Products', type: 'text' }, { k: 'path', label: 'Gateway Endpoint Path', placeholder: '/products', type: 'text' }].map(f => (
                <div key={f.k}>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#00f2fe', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'JetBrains Mono', monospace" }}>{f.label}</label>
                  <input required type={f.type} value={(newWf as any)[f.k]} onChange={e => setNewWf(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.placeholder}
                    className="input"
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1.5px solid rgba(0, 242, 254, 0.25)',
                      borderRadius: 0,
                      color: '#fff',
                      fontSize: 12,
                      fontFamily: "'JetBrains Mono', monospace",
                    }} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#00f2fe', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'JetBrains Mono', monospace" }}>REST Method</label>
                <select value={newWf.method} onChange={e => setNewWf(p => ({ ...p, method: e.target.value }))}
                  style={{
                    width: '100%',
                    background: '#040814',
                    border: '1.5px solid rgba(0, 242, 254, 0.25)',
                    color: '#fff',
                    fontSize: 12,
                    fontFamily: "'JetBrains Mono', monospace",
                    padding: '9px 12px',
                    outline: 'none'
                  }}>
                  {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowCreateWf(false)} className="btn btn-ghost" style={{ flex: 1, borderRadius: 0, border: '1px solid rgba(255,255,255,0.15)' }}>Cancel</button>
                <button type="submit"
                  style={{
                    flex: 2,
                    background: 'rgba(0, 242, 254, 0.15)',
                    border: '1.5px solid #00f2fe',
                    color: '#00f2fe',
                    borderRadius: 0,
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontFamily: "'JetBrains Mono', monospace",
                    cursor: 'pointer',
                    boxShadow: '0 0 15px rgba(0, 242, 254, 0.2)'
                  }}>Deploy Workflow</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── AI GENERATE MODAL ─────────────────────────── */}
      {showAi && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.92)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div className="cyber-plate-fuchsia tech-corners" style={{ background: '#0a0f1e', border: '2.5px solid #f355da', clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))', padding: 32, width: '100%', maxWidth: 520, boxShadow: '0 0 40px rgba(243, 85, 218, 0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, border: '1px solid #f355da', background: 'rgba(243, 85, 218, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>✨</div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Workflow Synthesizer</h2>
                <p style={{ fontSize: 11, color: '#f355da', fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>POWERED BY GEMINI · SPECIFY INSTRUCTIONS</p>
              </div>
              <button onClick={() => { setShowAi(false); setAiError(''); }} style={{ marginLeft: 'auto', width: 28, height: 28, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>✕</button>
            </div>

            {aiError && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '10px 14px', marginBottom: 16, color: '#fca5a5', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>⚠ PIPELINE FAIL: {aiError}</div>
            )}

            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {['Create a Product CRUD API', 'Build a User Auth workflow with JWT', 'Make a webhook that validates and stores events'].map(ex => (
                  <button key={ex} onClick={() => setAiPrompt(ex)}
                    style={{
                      padding: '5px 10px',
                      background: 'rgba(5, 10, 20, 0.6)',
                      border: '1.5px solid rgba(243, 85, 218, 0.25)',
                      color: '#94a3b8',
                      fontSize: 10,
                      fontFamily: "'JetBrains Mono', monospace",
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#f355da'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(243, 85, 218, 0.25)'; e.currentTarget.style.color = '#94a3b8'; }}>
                    {ex}
                  </button>
                ))}
              </div>
              <textarea
                value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                placeholder="Describe what API you want to build... e.g. 'Create a REST API that validates a JWT token, queries a PostgreSQL users table, and returns the user profile'"
                rows={4}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1.5px solid rgba(243, 85, 218, 0.25)',
                  color: '#fff',
                  fontSize: 12,
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: '12px',
                  outline: 'none',
                  resize: 'none',
                  boxSizing: 'border-box',
                  lineHeight: 1.6
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowAi(false); setAiError(''); }} className="btn btn-ghost" style={{ flex: 1, borderRadius: 0, border: '1px solid rgba(255,255,255,0.15)' }}>Cancel</button>
              <button onClick={handleAiGenerate} disabled={aiLoading || !aiPrompt.trim()}
                style={{
                  flex: 3,
                  background: aiLoading ? '#1e293b' : 'rgba(243, 85, 218, 0.15)',
                  border: '1.5px solid #f355da',
                  color: '#f355da',
                  borderRadius: 0,
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: "'JetBrains Mono', monospace",
                  cursor: aiLoading || !aiPrompt.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 0 15px rgba(243, 85, 218, 0.2)'
                }}>
                {aiLoading ? (
                  <><span className="spinner spinner-accent" style={{ borderTopColor: '#f355da' }} /> Synthesizing...</>
                ) : '✨ Synthesize Workflow'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── NODE CONFIG PANEL ─────────────────────────────────────────────────────
function NodeConfigPanel({ node, onChange }: { node: Node; onChange: (k: string, v: any) => void }) {
  const data = node.data as any;

  const Field = ({ label, fieldKey, type = 'text', placeholder = '' }: any) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>{label}</label>
      {type === 'textarea' ? (
        <textarea value={data[fieldKey] || ''} onChange={e => onChange(fieldKey, e.target.value)} placeholder={placeholder} rows={5}
          style={{
            width: '100%',
            background: 'rgba(0,0,0,0.3)',
            border: '1.5px solid rgba(0, 242, 254, 0.25)',
            borderRadius: 0,
            padding: '8px 10px',
            color: '#fff',
            fontSize: 11,
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 1.5
          }} />
      ) : type === 'select' ? null : (
        <input type={type} value={data[fieldKey] || ''} onChange={e => onChange(fieldKey, e.target.value)} placeholder={placeholder}
          style={{
            width: '100%',
            background: 'rgba(0,0,0,0.3)',
            border: '1.5px solid rgba(0, 242, 254, 0.25)',
            borderRadius: 0,
            padding: '8px 10px',
            color: '#fff',
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            outline: 'none',
            boxSizing: 'border-box'
          }} />
      )}
    </div>
  );

  const nodeConfigs: Record<string, React.ReactNode> = {
    triggerNode: (
      <>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>Method</label>
          <select value={data.method || 'GET'} onChange={e => onChange('method', e.target.value)}
            style={{
              width: '100%',
              background: '#040814',
              border: '1.5px solid rgba(0, 242, 254, 0.25)',
              color: '#fff',
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              padding: '8px 10px',
              outline: 'none'
            }}>
            {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <Field label="Path" fieldKey="path" placeholder="/api/resource" />
      </>
    ),

    webhookNode: <><Field label="Path" fieldKey="path" placeholder="/webhook/events" /><Field label="Secret" fieldKey="secret" type="password" placeholder="webhook secret" /></>,
    scheduledNode: <><Field label="Cron Expression" fieldKey="cron" placeholder="0 * * * *" /><Field label="Timezone" fieldKey="timezone" placeholder="UTC" /></>,
    databaseNode: <Field label="SQL Query" fieldKey="query" type="textarea" placeholder="SELECT * FROM users WHERE id = $request.params.id;" />,
    customCodeNode: <Field label="JavaScript Code" fieldKey="code" type="textarea" placeholder="const { body } = context.request;\nreturn { processed: true };" />,
    ifElseNode: <Field label="Condition (JS expression)" fieldKey="condition" placeholder="context.request.body.active === true" />,
    switchCaseNode: (
      <>
        <Field label="Expression (JS expression)" fieldKey="expression" placeholder="context.request.body.status" />
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
            Cases (comma-separated, include 'default')
          </label>
          <input
            type="text"
            value={(data.cases || []).join(', ')}
            onChange={e => {
              const val = e.target.value;
              const casesArr = val.split(',').map(s => s.trim()).filter(Boolean);
              onChange('cases', casesArr);
            }}
            placeholder="paid, pending, default"
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.3)',
              border: '1.5px solid rgba(0, 242, 254, 0.25)',
              borderRadius: 0,
              padding: '8px 10px',
              color: '#fff',
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </>
    ),
    transformNode: <Field label="Mapping (JS object)" fieldKey="mapping" type="textarea" placeholder="{\n  id: steps.db.id,\n  name: steps.db.name\n}" />,
    httpClientNode: (
      <>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>Method</label>
          <select value={data.method || 'GET'} onChange={e => onChange('method', e.target.value)}
            style={{
              width: '100%',
              background: '#040814',
              border: '1.5px solid rgba(0, 242, 254, 0.25)',
              color: '#fff',
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              padding: '8px 10px',
              outline: 'none'
            }}>
            {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <Field label="URL (use $request or $steps to interpolate)" fieldKey="url" placeholder="https://api.github.com/users/$request.body.username" />
        <Field label="Headers (JSON string)" fieldKey="headers" type="textarea" placeholder='{\n  "Content-Type": "application/json"\n}' />
        <Field label="Body (JSON / string / reference)" fieldKey="body" type="textarea" placeholder='{"text": "Hello $request.body.name"}' />
      </>
    ),
    jwtValidateNode: <Field label="JWT Secret (optional override)" fieldKey="secret" type="password" placeholder="uses env.JWT_SECRET if empty" />,
    apiKeyNode: <Field label="Header Name" fieldKey="headerName" placeholder="x-api-key" />,
    responseNode: (
      <>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>Status Code</label>
          <input type="number" value={data.statusCode || 200} onChange={e => onChange('statusCode', parseInt(e.target.value))}
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.3)',
              border: '1.5px solid rgba(0, 242, 254, 0.25)',
              borderRadius: 0,
              padding: '8px 10px',
              color: '#fff',
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              outline: 'none',
              boxSizing: 'border-box'
            }} />
        </div>
        <Field label="Body (use $steps.nodeId to reference)" fieldKey="body" type="textarea" placeholder="$steps.db_query" />
        <Field label="Custom Response Headers (JSON string)" fieldKey="headers" type="textarea" placeholder='{\n  "Content-Type": "text/html"\n}' />
        <Field label="Redirect URL (optional override)" fieldKey="redirectUrl" placeholder="https://example.com or $steps.codeNode.url" />
      </>
    ),
  };

  return (
    <div>
      <div style={{ padding: '8px 12px', background: 'rgba(0, 242, 254, 0.05)', border: '1px solid rgba(0, 242, 254, 0.25)', marginBottom: 16 }}>
        <div style={{ fontSize: 9, color: '#00f2fe', fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>NODE TELEMETRY KEY</div>
        <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{node.id}</div>
      </div>
      {nodeConfigs[node.type as string] || <div style={{ color: '#475569', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>NO DIAGNOSTICS CONFIGURATION AVAILABLE.</div>}
    </div>
  );
}
