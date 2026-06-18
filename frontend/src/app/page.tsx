'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  LayoutDashboard,
  GitBranch,
  Play,
  Database,
  Code,
  Send,
  Terminal,
  Settings,
  LogOut,
  User,
  Plus,
  Trash2,
  Save,
  Activity,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Share2,
  Compass,
  GitFork,
  Download,
  RefreshCw,
  Layers,
  ArrowRight,
  Sparkles,
  Lock,
  Globe,
  Check,
  X
} from 'lucide-react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  MarkerType,
  Connection,
  Edge,
  Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { io, Socket } from 'socket.io-client';
import { api, BASE_URL } from '../services/api';
import { nodeTypes } from '../components/customNodes';

// Theme styles for React Flow
const rfStyle = {
  backgroundColor: '#020617',
  width: '100%',
  height: '100%',
};

export default function Home() {
  // Mounting check to prevent Next.js hydration issues
  const [mounted, setMounted] = useState(false);

  // Authentication State
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; username: string; email: string } | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' });
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // SPA Navigation Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'canvas' | 'tester' | 'git'>('dashboard');

  // Projects State
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectLoading, setProjectLoading] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // Workflows State
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowPath, setNewWorkflowPath] = useState('');
  const [newWorkflowMethod, setNewWorkflowMethod] = useState('GET');
  const [isSavingWorkflow, setIsSavingWorkflow] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // React Flow States
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Exporter / Git State
  const [gitStatus, setGitStatus] = useState<'idle' | 'compiling' | 'success' | 'failed'>('idle');
  const [gitLogs, setGitLogs] = useState<string[]>([]);
  const [gitJobId, setGitJobId] = useState<string | null>(null);
  const [pushToGit, setPushToGit] = useState(false);
  const [gitRepoName, setGitRepoName] = useState('');
  const [gitToken, setGitToken] = useState('');
  const [gitConfigSaving, setGitConfigSaving] = useState(false);
  const [gitConfigExists, setGitConfigExists] = useState(false);

  // API Client Tester State
  const [testWorkflowId, setTestWorkflowId] = useState<string>('');
  const [testMethod, setTestMethod] = useState<string>('GET');
  const [testPath, setTestPath] = useState<string>('/api');
  const [testHeaders, setTestHeaders] = useState<string>('{\n  "Content-Type": "application/json"\n}');
  const [testBody, setTestBody] = useState<string>('{\n  "name": "Jane Doe"\n}');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testResponseStatus, setTestResponseStatus] = useState<number | null>(null);
  const [testResponseLatency, setTestResponseLatency] = useState<number | null>(null);
  const [testLoading, setTestLoading] = useState<boolean>(false);

  // Socket.IO Metrics Live Terminal
  const [logs, setLogs] = useState<any[]>([]);
  const [isTerminalPaused, setIsTerminalPaused] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Mount logic
  useEffect(() => {
    setMounted(true);
    const savedToken = localStorage.getItem('flowforge_token');
    const savedUser = localStorage.getItem('flowforge_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Fetch projects list when token updates
  useEffect(() => {
    if (token) {
      fetchProjects();
      fetchGitConfig();
    }
  }, [token]);

  // Handle socket connections when active project changes
  useEffect(() => {
    if (!token || !selectedProjectId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Connect to WebSocket server running on backend gateway (port 5000)
    const socket = io('http://localhost:5000');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 WebSocket connected:', socket.id);
      // Join active project metrics stream room
      socket.emit('join-project', selectedProjectId);
      setLogs((prev) => [
        {
          timestamp: new Date().toISOString(),
          type: 'system',
          message: `Joined Real-Time Metrics Pipeline for Project ID: ${selectedProjectId}`
        },
        ...prev
      ]);
    });

    socket.on('metrics', (metric: any) => {
      if (isTerminalPaused) return;
      setLogs((prev) => [
        {
          timestamp: metric.timestamp || new Date().toISOString(),
          type: 'metric',
          method: metric.method,
          path: metric.path,
          status: metric.responseStatus,
          latency: metric.latencyMs,
          error: metric.error
        },
        ...prev
      ].slice(0, 100)); // Cap logs size
    });

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [selectedProjectId, token, isTerminalPaused]);

  // Scroll terminal logs on update
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Auth Operations
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        const res = await api.auth.login({
          email: authForm.email,
          password: authForm.password,
        });
        localStorage.setItem('flowforge_token', res.token);
        localStorage.setItem('flowforge_user', JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
      } else {
        await api.auth.register({
          username: authForm.username,
          email: authForm.email,
          password: authForm.password,
        });
        // Auto-login after successful registration
        const loginRes = await api.auth.login({
          email: authForm.email,
          password: authForm.password,
        });
        localStorage.setItem('flowforge_token', loginRes.token);
        localStorage.setItem('flowforge_user', JSON.stringify(loginRes.user));
        setToken(loginRes.token);
        setUser(loginRes.user);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('flowforge_token');
    localStorage.removeItem('flowforge_user');
    setToken(null);
    setUser(null);
    setProjects([]);
    setSelectedProjectId(null);
    setWorkflows([]);
    setSelectedWorkflowId(null);
    setNodes([]);
    setEdges([]);
    setLogs([]);
  };

  // Projects Operations
  const fetchProjects = async () => {
    setProjectLoading(true);
    try {
      const list = await api.projects.list();
      setProjects(list);
      if (list.length > 0 && !selectedProjectId) {
        setSelectedProjectId(list[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load projects', err);
    } finally {
      setProjectLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const newProj = await api.projects.create({
        name: newProjectName,
        description: newProjectDesc,
      });
      setProjects((prev) => [newProj, ...prev]);
      setSelectedProjectId(newProj.id);
      setNewProjectName('');
      setNewProjectDesc('');
      setIsCreatingProject(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create project');
    }
  };

  // Workflows Operations
  const fetchWorkflows = useCallback(async (projId: string) => {
    setWorkflowLoading(true);
    try {
      const list = await api.workflows.list(projId);
      setWorkflows(list);
      if (list.length > 0) {
        // Find existing selected workflow or default to first
        const match = list.find((w: any) => w.id === selectedWorkflowId);
        if (!match) {
          loadWorkflowDetails(list[0].id);
        }
      } else {
        setSelectedWorkflowId(null);
        setNodes([]);
        setEdges([]);
      }
    } catch (err: any) {
      console.error('Failed to load workflows', err);
    } finally {
      setWorkflowLoading(false);
    }
  }, [selectedWorkflowId]);

  // Trigger loading when project changes
  useEffect(() => {
    if (selectedProjectId) {
      fetchWorkflows(selectedProjectId);
    }
  }, [selectedProjectId, fetchWorkflows]);

  const loadWorkflowDetails = async (wfId: string) => {
    setSelectedWorkflowId(wfId);
    setSelectedNodeId(null);
    try {
      const workflow = await api.workflows.get(wfId);
      // Map nodes and edges back to React Flow states
      setNodes((workflow.nodes as Node[]) || []);
      setEdges((workflow.edges as Edge[]) || []);

      // If we loaded a workflow, preset test properties for tester tab
      setTestWorkflowId(workflow.id);
      setTestMethod(workflow.method);
      setTestPath(workflow.path);
    } catch (err: any) {
      console.error('Failed to load workflow details', err);
    }
  };

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !newWorkflowName.trim() || !newWorkflowPath.trim()) return;

    // Standardize path prefix
    let formattedPath = newWorkflowPath.trim();
    if (!formattedPath.startsWith('/')) {
      formattedPath = '/' + formattedPath;
    }

    try {
      const newWf = await api.workflows.create(selectedProjectId, {
        name: newWorkflowName,
        method: newWorkflowMethod,
        path: formattedPath,
      });
      setWorkflows((prev) => [newWf, ...prev]);
      setIsCreatingWorkflow(false);
      setNewWorkflowName('');
      setNewWorkflowPath('');
      loadWorkflowDetails(newWf.id);
    } catch (err: any) {
      alert(err.message || 'Failed to create workflow');
    }
  };

  const handleSaveWorkflow = async () => {
    if (!selectedWorkflowId) return;
    setIsSavingWorkflow(true);
    try {
      // Find and update trigger node in DB metadata if route path/method changed on visual canvas
      const triggerNode = nodes.find(n => n.type === 'triggerNode');
      let method = undefined;
      let path = undefined;
      if (triggerNode) {
        method = triggerNode.data.method as string;
        path = triggerNode.data.path as string;
      }

      await api.workflows.update(selectedWorkflowId, {
        nodes,
        edges,
        method,
        path
      });

      // Reload project list to sync workflow titles/paths
      if (selectedProjectId) {
        const list = await api.workflows.list(selectedProjectId);
        setWorkflows(list);
      }

      setLogs((prev) => [
        {
          timestamp: new Date().toISOString(),
          type: 'system',
          message: `Saved layout structure for workflow: ${workflows.find(w => w.id === selectedWorkflowId)?.name}`
        },
        ...prev
      ]);
    } catch (err: any) {
      alert(err.message || 'Failed to save workflow layout');
    } finally {
      setIsSavingWorkflow(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!selectedWorkflowId) return;
    const currentWf = workflows.find((w) => w.id === selectedWorkflowId);
    if (!currentWf) return;

    setIsPublishing(true);
    const targetPublishState = !currentWf.isPublished;

    try {
      await api.workflows.publish(selectedWorkflowId, targetPublishState);
      setWorkflows((prev) =>
        prev.map((w) => (w.id === selectedWorkflowId ? { ...w, isPublished: targetPublishState } : w))
      );
      setLogs((prev) => [
        {
          timestamp: new Date().toISOString(),
          type: 'system',
          message: `Workflow '${currentWf.name}' has been ${targetPublishState ? 'PUBLISHED' : 'UNPUBLISHED'}`
        },
        ...prev
      ]);
    } catch (err: any) {
      alert(err.message || 'Failed to update publishing state');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeleteWorkflow = async () => {
    if (!selectedWorkflowId) return;
    if (!confirm('Are you sure you want to delete this workflow? This action is permanent.')) return;

    try {
      await api.workflows.delete(selectedWorkflowId);
      setWorkflows((prev) => prev.filter((w) => w.id !== selectedWorkflowId));
      setSelectedWorkflowId(null);
      setNodes([]);
      setEdges([]);
    } catch (err: any) {
      alert(err.message || 'Failed to delete workflow');
    }
  };

  // Node Parameters Editor callbacks
  const handleNodeDataChange = (key: string, value: any) => {
    if (!selectedNodeId) return;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              [key]: value,
            },
          };
        }
        return node;
      })
    );
  };

  // React Flow Connections / Updates
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: '#6366f1', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#6366f1',
            },
          },
          eds
        )
      ),
    [setEdges]
  );

  const addNodeToCanvas = (type: 'triggerNode' | 'databaseNode' | 'customCodeNode' | 'responseNode') => {
    if (!selectedWorkflowId) return;

    // Only allow one trigger node per canvas
    if (type === 'triggerNode' && nodes.some((n) => n.type === 'triggerNode')) {
      alert('Only one HTTP Trigger entry node is permitted per workflow routing pipeline.');
      return;
    }

    const id = `node_${Date.now()}`;
    const newPosition = {
      x: nodes.length * 30 + 100,
      y: nodes.length * 20 + 150,
    };

    let defaultData: any = {};
    switch (type) {
      case 'triggerNode':
        const currentWf = workflows.find((w) => w.id === selectedWorkflowId);
        defaultData = {
          method: currentWf?.method || 'GET',
          path: currentWf?.path || '/api/endpoint',
        };
        break;
      case 'databaseNode':
        defaultData = {
          query: 'SELECT * FROM users LIMIT 10;',
        };
        break;
      case 'customCodeNode':
        defaultData = {
          code: '// Access arguments in the execution context\nconst body = context.request.body;\n\nreturn {\n  processed: true,\n  payload: body\n};',
        };
        break;
      case 'responseNode':
        defaultData = {
          statusCode: 200,
          body: '$steps.previous_node_id',
        };
        break;
    }

    const newNode: Node = {
      id,
      type,
      position: newPosition,
      data: defaultData,
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedNodeId(id);
  };

  const deleteSelectedNode = () => {
    if (!selectedNodeId) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId));
    setSelectedNodeId(null);
  };

  // Find active node data for parameter sidebar
  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  // Mock Git configurations saving on backend
  const fetchGitConfig = async () => {
    // Check if configuration exists
    try {
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('flowforge_token')}` };
      const res = await fetch('http://localhost:5000/api/git-config', { headers }).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (data.config) {
          setGitRepoName(data.config.repositoryName || '');
          setGitConfigExists(true);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleSaveGitConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gitRepoName.trim() || !gitToken.trim()) return;
    setGitConfigSaving(true);
    try {
      // Direct call to database via custom API helper (we will create this endpoint in backend)
      const res = await fetch('http://localhost:5000/api/git-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('flowforge_token')}`
        },
        body: JSON.stringify({
          repositoryName: gitRepoName,
          accessToken: gitToken,
          provider: 'GITHUB'
        })
      });
      if (!res.ok) throw new Error('Failed to save Git OAuth configuration');
      setGitConfigExists(true);
      alert('GitHub Configuration updated and active!');
    } catch (err: any) {
      alert(err.message || 'Could not update configuration');
    } finally {
      setGitConfigSaving(false);
    }
  };

  // Compiler Job triggers
  const handleTriggerCompilation = async () => {
    if (!selectedProjectId) return;
    setGitStatus('compiling');
    setGitLogs(['Initializing code compiler queue task...']);

    try {
      const res = await api.exporter.exportProject(selectedProjectId, pushToGit);
      const jobId = res.jobId;
      setGitJobId(jobId);
      setGitLogs((prev) => [...prev, `Compiler task queued. Job ID: ${jobId}`, 'Polling build queue...']);

      // Setup Poller
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        if (attempts > 30) {
          clearInterval(interval);
          setGitStatus('failed');
          setGitLogs((prev) => [...prev, 'Error: Build timed out in job queue.']);
          return;
        }

        try {
          const status = await api.exporter.getJobStatus(selectedProjectId, jobId);
          setGitLogs((prev) => {
            const nextLogs = [...prev];
            nextLogs.push(`[${new Date().toLocaleTimeString()}] Status: ${status.state.toUpperCase()} | Progress: ${status.progress || 0}%`);
            if (status.failedReason) {
              nextLogs.push(`❌ Failure reason: ${status.failedReason}`);
            }
            return nextLogs;
          });

          if (status.state === 'completed') {
            clearInterval(interval);
            setGitStatus('success');
            setGitLogs((prev) => [...prev, '📦 Compilation compilation successful!', pushToGit ? '🚀 Codebase successfully pushed to remote GitHub repo!' : '💾 Local ZIP build packaging ready for download.']);
          } else if (status.state === 'failed') {
            clearInterval(interval);
            setGitStatus('failed');
          }
        } catch (pollErr: any) {
          clearInterval(interval);
          setGitStatus('failed');
          setGitLogs((prev) => [...prev, `Poller error: ${pollErr.message}`]);
        }
      }, 2500);

    } catch (err: any) {
      setGitStatus('failed');
      setGitLogs((prev) => [...prev, `❌ Compilation initiation failed: ${err.message}`]);
    }
  };

  const handleDownloadZip = () => {
    if (!selectedProjectId) return;
    window.open(api.exporter.getDownloadUrl(selectedProjectId));
  };

  // API Client Tester Trigger
  const handleSendTestRequest = async () => {
    if (!selectedProjectId) return;
    setTestLoading(true);
    setTestResponse(null);
    setTestResponseStatus(null);
    setTestResponseLatency(null);

    const startTime = performance.now();
    // Resolve full path URL: e.g. http://localhost:5000/api/{projectId}/{path}
    const cleanPath = testPath.startsWith('/') ? testPath : `/${testPath}`;
    const url = `http://localhost:5000/api/${selectedProjectId}${cleanPath}`;

    try {
      let parsedHeaders = {};
      try {
        parsedHeaders = JSON.parse(testHeaders);
      } catch (e) {
        throw new Error('Invalid JSON format in Request Headers textbox');
      }

      let reqOptions: RequestInit = {
        method: testMethod,
        headers: {
          'Content-Type': 'application/json',
          ...parsedHeaders
        }
      };

      if (testMethod !== 'GET' && testMethod !== 'DELETE') {
        try {
          JSON.parse(testBody);
          reqOptions.body = testBody;
        } catch (e) {
          throw new Error('Invalid JSON format in Request Body textbox');
        }
      }

      const res = await fetch(url, reqOptions);
      const endTime = performance.now();
      setTestResponseLatency(Math.round(endTime - startTime));
      setTestResponseStatus(res.status);

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const json = await res.json();
        setTestResponse(json);
      } else {
        const text = await res.text();
        setTestResponse({ text });
      }
    } catch (err: any) {
      setTestResponse({ error: err.message || 'Network request failed' });
      setTestResponseStatus(500);
    } finally {
      setTestLoading(false);
    }
  };

  // Render node panel options helper
  const getNodeBorderColor = (type: string) => {
    switch (type) {
      case 'triggerNode': return 'border-emerald-500 text-emerald-400';
      case 'databaseNode': return 'border-sky-500 text-sky-400';
      case 'customCodeNode': return 'border-amber-500 text-amber-400';
      case 'responseNode': return 'border-indigo-500 text-indigo-400';
      default: return 'border-slate-700';
    }
  };

  // Prevent SSR render mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-slate-500 text-sm mt-3">Booting FlowForge Web Console...</span>
      </div>
    );
  }

  // AUTH SCREEN RENDER
  if (!token) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
        {/* Background blobs */}
        <div className="absolute top-[-20%] left-[-15%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none" />

        <div className="w-full max-w-md z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-950/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3 animate-pulse">
              <Sparkles size={12} />
              Next-Gen Orchestration
            </div>
            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-indigo-200 via-indigo-400 to-violet-300 bg-clip-text text-transparent">
              FlowForge Console
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Visual pipeline editor & serverless API orchestrator
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
            {/* Tab selector */}
            <div className="flex bg-slate-950/80 rounded-lg p-1 border border-slate-850 mb-6">
              <button
                onClick={() => { setAuthMode('login'); setAuthError(null); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                  authMode === 'login' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthMode('register'); setAuthError(null); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                  authMode === 'register' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Username</label>
                  <input
                    type="text"
                    required
                    value={authForm.username}
                    onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                    placeholder="johndoe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  placeholder="name@company.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  required
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              {authError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg p-3 flex gap-2 items-start">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-2.5 rounded-lg transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : authMode === 'login' ? (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} />
                  </>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  // MAIN SPA APPLICATION RENDER
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative selection:bg-indigo-500 selection:text-white">
      {/* Background glowing blobs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-[100px] pointer-events-none" />

      {/* HEADER SECTION */}
      <header className="bg-slate-900/40 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Layers size={18} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-md tracking-tight text-slate-200">FlowForge</span>
              <span className="bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                CONSOLE
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Visual REST Pipeline Architect</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex bg-slate-950/80 border border-slate-850 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard size={13} />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('canvas')}
            disabled={!selectedProjectId}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              !selectedProjectId ? 'opacity-40 cursor-not-allowed' : ''
            } ${activeTab === 'canvas' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <GitBranch size={13} />
            Visual Canvas
          </button>
          <button
            onClick={() => setActiveTab('tester')}
            disabled={!selectedProjectId}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              !selectedProjectId ? 'opacity-40 cursor-not-allowed' : ''
            } ${activeTab === 'tester' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Play size={13} />
            API Tester
          </button>
          <button
            onClick={() => setActiveTab('git')}
            disabled={!selectedProjectId}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              !selectedProjectId ? 'opacity-40 cursor-not-allowed' : ''
            } ${activeTab === 'git' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <GitFork size={13} />
            Git Deploy
          </button>
        </nav>

        {/* Project Selector & Profile */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Scope:</span>
            {projectLoading ? (
              <span className="text-xs text-slate-400">Loading...</span>
            ) : (
              <select
                value={selectedProjectId || ''}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  setSelectedWorkflowId(null);
                }}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => setIsCreatingProject(true)}
              className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 rounded-lg transition-all"
              title="Create New Project"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="h-5 w-[1px] bg-slate-800" />

          {/* User profile dropdown info */}
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-full bg-slate-900 border border-slate-800 text-indigo-400">
              <User size={14} />
            </div>
            <span className="text-xs font-bold text-slate-300 hidden sm:inline">{user?.username}</span>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* BODY WORKSPACE AREA */}
      <div className="flex-1 overflow-hidden flex relative">

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-100">Project Workspace Overview</h1>
                <p className="text-sm text-slate-400">Manage API gateway routes and monitor compilation pipelines</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCreatingWorkflow(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-lg shadow-indigo-600/15 flex items-center gap-1.5 transition-all"
                >
                  <Plus size={14} />
                  New Gateway Route
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start text-slate-500">
                  <span className="text-xs font-semibold uppercase tracking-wider">Gateway Routes</span>
                  <Compass size={16} />
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-bold text-slate-100">{workflows.length}</span>
                  <p className="text-[10px] text-slate-500 mt-1">Configured pipeline schemas</p>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start text-slate-500">
                  <span className="text-xs font-semibold uppercase tracking-wider">Gateway Status</span>
                  <Globe size={16} />
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-md font-semibold text-emerald-400">Live Gateway</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Accepting traffic at port 5000</p>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start text-slate-500">
                  <span className="text-xs font-semibold uppercase tracking-wider">Compilation State</span>
                  <GitBranch size={16} />
                </div>
                <div className="mt-4">
                  <span className={`text-sm font-semibold capitalize ${
                    gitStatus === 'success' ? 'text-indigo-400' : gitStatus === 'failed' ? 'text-rose-400' : 'text-slate-400'
                  }`}>
                    {gitStatus === 'idle' ? 'Uncompiled' : gitStatus}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">Project export queue tracking</p>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start text-slate-500">
                  <span className="text-xs font-semibold uppercase tracking-wider">Live Logging</span>
                  <Terminal size={16} />
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-indigo-400 animate-pulse" />
                    <span className="text-sm font-bold font-mono text-slate-200">Listening...</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Socket.IO subscription active</p>
                </div>
              </div>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="bg-slate-900/30 border border-slate-850 rounded-xl p-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Activity size={14} className="text-indigo-400" />
                Historical Request Frequency (Mocked)
              </h3>
              <div className="w-full h-48 flex items-end justify-between gap-1 mt-4 relative">
                {/* SVG background grid lines */}
                <div className="absolute inset-x-0 top-0 border-t border-slate-800/50" />
                <div className="absolute inset-x-0 top-1/3 border-t border-slate-800/30" />
                <div className="absolute inset-x-0 top-2/3 border-t border-slate-800/30" />

                {/* Custom SVG Area Chart */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 700 180" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Glowing line path */}
                  <path
                    d="M 0 160 Q 100 120 180 140 T 320 80 T 450 110 T 580 40 T 700 30 L 700 180 L 0 180 Z"
                    fill="url(#chartGrad)"
                  />
                  <path
                    d="M 0 160 Q 100 120 180 140 T 320 80 T 450 110 T 580 40 T 700 30"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Labels */}
                <div className="absolute left-2 top-2 text-[9px] font-mono text-slate-600 bg-slate-950/40 px-1 py-0.5 rounded border border-slate-900">1.2k req/m</div>
                <div className="absolute left-2 top-[60px] text-[9px] font-mono text-slate-600 bg-slate-950/40 px-1 py-0.5 rounded border border-slate-900">800 req/m</div>
                <div className="absolute left-2 top-[120px] text-[9px] font-mono text-slate-600 bg-slate-950/40 px-1 py-0.5 rounded border border-slate-900">400 req/m</div>

                <div className="z-10 flex w-full justify-between px-2 text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/60 mt-1">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>

            {/* Gateway Routes List */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Gateway Routing Endpoints</span>
                <span className="bg-indigo-600/15 border border-indigo-500/25 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {workflows.length} Active
                </span>
              </div>

              {workflows.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center justify-center gap-3">
                  <Globe className="text-slate-600 w-10 h-10 animate-pulse" />
                  <span className="text-slate-500 text-sm">No routing gateway endpoints created yet.</span>
                  <button
                    onClick={() => setIsCreatingWorkflow(true)}
                    className="text-xs text-indigo-400 font-semibold hover:underline mt-1"
                  >
                    Create your first endpoint workflow
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/65">
                  {workflows.map((wf) => (
                    <div key={wf.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-900/20 transition-all group">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 border rounded-md text-[10px] font-bold tracking-wide ${
                          wf.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          wf.method === 'POST' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                          wf.method === 'PUT' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {wf.method}
                        </span>
                        <div>
                          <span className="text-xs font-bold font-mono text-slate-200 group-hover:text-indigo-400 transition-colors">
                            {wf.path}
                          </span>
                          <span className="text-[10px] text-slate-500 block">Name: {wf.name}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Publish state badge */}
                        {wf.isPublished ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1 h-1 rounded-full bg-emerald-400" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                            <span className="w-1 h-1 rounded-full bg-slate-500" />
                            Draft
                          </span>
                        )}

                        <button
                          onClick={() => {
                            setSelectedWorkflowId(wf.id);
                            loadWorkflowDetails(wf.id);
                            setActiveTab('canvas');
                          }}
                          className="text-xs bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-white px-3 py-1 rounded-lg transition-all"
                        >
                          Visual Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: VISUAL EDITOR CANVAS */}
        {activeTab === 'canvas' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left side panel: workflows selection list */}
            <aside className="w-60 bg-slate-900/40 border-r border-slate-800/80 flex flex-col z-10 shrink-0">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/20">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Routing Pipelines</span>
                <button
                  onClick={() => setIsCreatingWorkflow(true)}
                  className="p-1.5 bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-md transition-all"
                  title="New Route Workflow"
                >
                  <Plus size={13} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {workflows.map((wf) => (
                  <button
                    key={wf.id}
                    onClick={() => loadWorkflowDetails(wf.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between group ${
                      selectedWorkflowId === wf.id
                        ? 'bg-indigo-600 text-white font-semibold shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate max-w-[130px]">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        wf.isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'
                      }`} />
                      <span className="truncate">{wf.name}</span>
                    </div>

                    <span className={`px-1 py-0.5 rounded text-[8px] font-bold uppercase shrink-0 ${
                      selectedWorkflowId === wf.id
                        ? 'bg-indigo-700 text-indigo-200'
                        : 'bg-slate-950 text-slate-500 border border-slate-900 group-hover:border-slate-800'
                    }`}>
                      {wf.method}
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            {/* Central Editor Workspace */}
            <div className="flex-1 h-full flex flex-col relative overflow-hidden bg-slate-950">
              {/* Header editor controls toolbar */}
              <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between z-10 shrink-0 select-none">
                {selectedWorkflowId ? (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-widest bg-slate-950 border border-slate-850 px-2.5 py-1 rounded-md">
                        {workflows.find(w => w.id === selectedWorkflowId)?.name}
                      </span>
                      <div className="flex items-center gap-1 bg-slate-950 border border-slate-850 p-0.5 rounded-lg">
                        <button
                          onClick={() => addNodeToCanvas('triggerNode')}
                          className="px-2 py-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white rounded transition-all"
                        >
                          + HTTP Trigger
                        </button>
                        <button
                          onClick={() => addNodeToCanvas('databaseNode')}
                          className="px-2 py-1 text-[10px] font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500 hover:text-white rounded transition-all"
                        >
                          + Database Node
                        </button>
                        <button
                          onClick={() => addNodeToCanvas('customCodeNode')}
                          className="px-2 py-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500 hover:text-white rounded transition-all"
                        >
                          + Code Node
                        </button>
                        <button
                          onClick={() => addNodeToCanvas('responseNode')}
                          className="px-2 py-1 text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white rounded transition-all"
                        >
                          + HTTP Response
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveWorkflow}
                        disabled={isSavingWorkflow}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/15"
                      >
                        {isSavingWorkflow ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                        Save Flow
                      </button>

                      <button
                        onClick={handlePublishToggle}
                        disabled={isPublishing}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md ${
                          workflows.find(w => w.id === selectedWorkflowId)?.isPublished
                            ? 'bg-rose-600/15 border border-rose-500/20 text-rose-400 hover:bg-rose-600 hover:text-white'
                            : 'bg-emerald-600/15 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-600 hover:text-white'
                        }`}
                      >
                        {isPublishing && <Loader2 size={13} className="animate-spin" />}
                        {workflows.find(w => w.id === selectedWorkflowId)?.isPublished ? 'Unpublish' : 'Publish'}
                      </button>

                      <button
                        onClick={handleDeleteWorkflow}
                        className="p-1.5 bg-slate-950 border border-slate-850 hover:border-rose-500/30 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition-all"
                        title="Delete Workflow"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                ) : (
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Select a workflow to initialize canvas</span>
                )}
              </div>

              {/* React Flow Editor Workspace Canvas */}
              {selectedWorkflowId ? (
                <div className="flex-1 w-full h-full">
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    style={rfStyle}
                    fitView
                    onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                    onPaneClick={() => setSelectedNodeId(null)}
                  >
                    <Background color="#1e293b" gap={16} />
                    <Controls />
                    <MiniMap
                      style={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #1e293b'
                      }}
                      nodeColor={(n) => {
                        if (n.type === 'triggerNode') return '#10b981';
                        if (n.type === 'databaseNode') return '#0ea5e9';
                        if (n.type === 'customCodeNode') return '#f59e0b';
                        if (n.type === 'responseNode') return '#6366f1';
                        return '#64748b';
                      }}
                    />
                  </ReactFlow>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-slate-950">
                  <GitBranch size={32} className="text-slate-800 animate-bounce" />
                  <span className="text-slate-600 text-sm">Please select a pipeline route workflow from the sidebar</span>
                </div>
              )}
            </div>

            {/* Right side parameters editor panel */}
            <aside className="w-80 bg-slate-900/40 border-l border-slate-800/80 flex flex-col z-10 shrink-0 overflow-y-auto">
              <div className="p-4 border-b border-slate-800 bg-slate-950/20">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Node Parameters</span>
              </div>

              {selectedNode ? (
                <div className="p-4 space-y-4">
                  {/* Common Properties */}
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">NODE ID</span>
                    <div className="flex items-center justify-between bg-slate-950 border border-slate-850 p-2 rounded-lg font-mono text-[10px] text-indigo-400">
                      <span>{selectedNode.id}</span>
                      <button
                        onClick={deleteSelectedNode}
                        className="text-slate-500 hover:text-rose-400"
                        title="Delete Node"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="h-[1px] bg-slate-850" />

                  {/* Trigger Node Settings */}
                  {selectedNode.type === 'triggerNode' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1.5 uppercase">HTTP REQUEST METHOD</label>
                        <select
                          value={(selectedNode.data as any).method || 'GET'}
                          onChange={(e) => handleNodeDataChange('method', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none"
                        >
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                          <option value="PUT">PUT</option>
                          <option value="DELETE">DELETE</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1.5 uppercase">GATEWAY ROUTE PATH</label>
                        <input
                          type="text"
                          value={(selectedNode.data as any).path || ''}
                          onChange={(e) => handleNodeDataChange('path', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                        />
                        <p className="text-[9px] text-slate-500 mt-1">Supports parameters: e.g. /users/:id</p>
                      </div>
                    </div>
                  )}

                  {/* Database Node Settings */}
                  {selectedNode.type === 'databaseNode' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1.5 uppercase">SQL QUERY SCRIPT</label>
                        <textarea
                          rows={8}
                          value={(selectedNode.data as any).query || ''}
                          onChange={(e) => handleNodeDataChange('query', e.target.value)}
                          placeholder="SELECT * FROM table;"
                          className="w-full bg-slate-950 border border-slate-850 text-sky-300 font-mono text-xs rounded-lg p-2 focus:outline-none focus:border-indigo-500 scrollbar-thin"
                        />
                        <p className="text-[9px] text-slate-500 mt-1">Parameters are resolved via `$request.query.id` templates.</p>
                      </div>
                    </div>
                  )}

                  {/* Custom Code Node Settings */}
                  {selectedNode.type === 'customCodeNode' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1.5 uppercase">JAVASCRIPT SANDBOX CODE</label>
                        <textarea
                          rows={12}
                          value={(selectedNode.data as any).code || ''}
                          onChange={(e) => handleNodeDataChange('code', e.target.value)}
                          placeholder="return { success: true };"
                          className="w-full bg-slate-950 border border-slate-850 text-amber-300 font-mono text-xs rounded-lg p-2 focus:outline-none focus:border-indigo-500 scrollbar-thin"
                        />
                        <p className="text-[9px] text-slate-500 mt-1">Sandbox environment with global variables context purged.</p>
                      </div>
                    </div>
                  )}

                  {/* Response Node Settings */}
                  {selectedNode.type === 'responseNode' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1.5 uppercase">HTTP STATUS CODE</label>
                        <input
                          type="number"
                          value={(selectedNode.data as any).statusCode || 200}
                          onChange={(e) => handleNodeDataChange('statusCode', parseInt(e.target.value) || 200)}
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1.5 uppercase">RESPONSE BODY JSON / POINTER</label>
                        <input
                          type="text"
                          value={(selectedNode.data as any).body || ''}
                          onChange={(e) => handleNodeDataChange('body', e.target.value)}
                          placeholder="$steps.node_id"
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                        />
                        <p className="text-[9px] text-slate-500 mt-1">Provide JSON string or pointer like `$steps.node_id` referencing a previous step output.</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-10 text-center flex flex-col items-center justify-center gap-3">
                  <Settings className="text-slate-800 w-10 h-10 animate-spin" />
                  <span className="text-slate-500 text-xs">Click a visual node in the editor to inspect parameters</span>
                </div>
              )}
            </aside>
          </div>
        )}

        {/* TAB 3: API CLIENT TESTER */}
        {activeTab === 'tester' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-6">
            <div>
              <h1 className="text-2xl font-black text-slate-100">Gateway API Client Tester</h1>
              <p className="text-sm text-slate-400">Trigger active routing pipelines and review payload outputs</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left sidebar: published endpoints selection */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 space-y-4">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Project Routes</span>
                {workflows.length === 0 ? (
                  <span className="text-xs text-slate-500">No gateway endpoints configured</span>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {workflows.map((w) => (
                      <button
                        key={w.id}
                        onClick={() => {
                          setTestWorkflowId(w.id);
                          setTestMethod(w.method);
                          setTestPath(w.path);
                        }}
                        className={`w-full text-left p-3 rounded-lg border text-xs font-mono transition-all flex items-center justify-between group ${
                          testWorkflowId === w.id
                            ? 'bg-indigo-600/10 border-indigo-500/60 text-indigo-200'
                            : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <div className="truncate max-w-[150px]">
                          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${
                            w.isPublished ? 'bg-emerald-500' : 'bg-slate-500'
                          }`} />
                          {w.name}
                        </div>
                        <span className={`px-1 py-0.5 rounded text-[9px] font-bold ${
                          w.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-sky-500/10 text-sky-400'
                        }`}>
                          {w.method}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Center/Right form & response */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
                  {/* Address input */}
                  <div className="flex gap-2">
                    <select
                      value={testMethod}
                      onChange={(e) => setTestMethod(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold rounded-lg px-3 py-2.5 focus:outline-none"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>

                    <div className="flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-lg overflow-hidden px-3.5 py-1.5 gap-1 shadow-inner">
                      <span className="text-xs text-slate-600 font-mono select-none">
                        http://localhost:5000/api/{selectedProjectId}
                      </span>
                      <input
                        type="text"
                        value={testPath}
                        onChange={(e) => setTestPath(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-xs font-mono text-slate-100 placeholder-slate-600"
                        placeholder="/users"
                      />
                    </div>

                    <button
                      onClick={handleSendTestRequest}
                      disabled={testLoading}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
                    >
                      {testLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      Send
                    </button>
                  </div>

                  {/* Headers text area */}
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1.5 uppercase">Request Headers (JSON)</label>
                    <textarea
                      rows={3}
                      value={testHeaders}
                      onChange={(e) => setTestHeaders(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 font-mono text-xs text-indigo-300 rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 scrollbar-thin"
                    />
                  </div>

                  {/* Body text area */}
                  {testMethod !== 'GET' && testMethod !== 'DELETE' && (
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1.5 uppercase">Request Body (JSON)</label>
                      <textarea
                        rows={5}
                        value={testBody}
                        onChange={(e) => setTestBody(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 font-mono text-xs text-emerald-300 rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 scrollbar-thin"
                      />
                    </div>
                  )}
                </div>

                {/* Response Display */}
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col min-h-64">
                  <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/20">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Server Response</span>
                    {testResponseStatus !== null && (
                      <div className="flex gap-4 text-[10px] font-mono">
                        <span>Status: <strong className={testResponseStatus < 400 ? 'text-emerald-400' : 'text-rose-400'}>{testResponseStatus}</strong></span>
                        <span>Time: <strong className="text-indigo-400">{testResponseLatency}ms</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 bg-slate-950/60 p-4 font-mono text-xs overflow-auto max-h-96 scrollbar-thin">
                    {testLoading ? (
                      <div className="h-44 flex items-center justify-center text-slate-500 gap-2">
                        <Loader2 className="animate-spin" size={16} />
                        Executing pipeline gateway routing...
                      </div>
                    ) : testResponse ? (
                      <pre className="text-slate-300 whitespace-pre-wrap">{JSON.stringify(testResponse, null, 2)}</pre>
                    ) : (
                      <div className="h-44 flex items-center justify-center text-slate-600">
                        No requests triggered. Set parameters and click Send to test.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GIT SYNC & DEPLOY */}
        {activeTab === 'git' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6">
            <div>
              <h1 className="text-2xl font-black text-slate-100">Git Syncer & Code Exporter</h1>
              <p className="text-sm text-slate-400">Compile visually designed graphs into backend files and deploy</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GitHub connection configuration */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                  <GitBranch size={16} className="text-indigo-400" />
                  GitHub OAuth Configuration
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Map this project compilation to a remote GitHub repository. Triggering pushes will execute incremental commits using Git databases API.
                </p>

                <form onSubmit={handleSaveGitConfig} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1.5">REPOSITORY PATH (owner/repo)</label>
                    <input
                      type="text"
                      required
                      value={gitRepoName}
                      onChange={(e) => setGitRepoName(e.target.value)}
                      placeholder="octocat/hello-world"
                      className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1.5">PERSONAL ACCESS TOKEN (PAT)</label>
                    <input
                      type="password"
                      required={!gitConfigExists}
                      value={gitToken}
                      onChange={(e) => setGitToken(e.target.value)}
                      placeholder={gitConfigExists ? "••••••••••••••••" : "ghp_xxxxxxxxxxxx"}
                      className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={gitConfigSaving}
                    className="w-full bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-white text-xs font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    {gitConfigSaving && <Loader2 size={13} className="animate-spin" />}
                    Save GitHub OAuth Connection
                  </button>
                </form>
              </div>

              {/* Compilation deployment actions */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-400" />
                    Trigger Code Compiler Exporter
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This will parse all visual pipelines, generate a complete backend server codebase including routers, sandboxes, and database connections, and output it.
                  </p>

                  <div className="flex items-center gap-2.5 p-3 bg-slate-950/65 border border-slate-850 rounded-lg">
                    <input
                      type="checkbox"
                      id="pushToGitCheck"
                      checked={pushToGit}
                      onChange={(e) => setPushToGit(e.target.checked)}
                      disabled={!gitConfigExists}
                      className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                    />
                    <label htmlFor="pushToGitCheck" className={`text-xs font-medium ${!gitConfigExists ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300'}`}>
                      Push directly to GitHub repository after compile
                    </label>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleTriggerCompilation}
                    disabled={gitStatus === 'compiling'}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-xs font-bold py-2.5 rounded-lg transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5"
                  >
                    {gitStatus === 'compiling' ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Compiling Visual Codebase...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={14} />
                        Run Build Compilation
                      </>
                    )}
                  </button>

                  {gitStatus === 'success' && !pushToGit && (
                    <button
                      onClick={handleDownloadZip}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/15"
                    >
                      <Download size={14} />
                      Download Compiled ZIP Package
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Compilation Console logs output */}
            {(gitLogs.length > 0 || gitStatus !== 'idle') && (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col">
                <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/20 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Compiler Build Logs</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    gitStatus === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    gitStatus === 'failed' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 animate-pulse'
                  }`}>
                    {gitStatus}
                  </span>
                </div>

                <div className="bg-slate-950/80 p-4 font-mono text-[11px] text-indigo-300 space-y-1.5 max-h-56 overflow-y-auto scrollbar-thin">
                  {gitLogs.map((log, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="text-slate-600 select-none">[{index + 1}]</span>
                      <span className="whitespace-pre-wrap">{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FLOATING REAL-TIME TERMINAL FOOTER LOGS */}
      <footer className="bg-slate-950 border-t border-slate-850 h-56 flex flex-col z-20 shrink-0">
        <div className="px-4 py-2 border-b border-slate-850 bg-slate-900/40 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Terminal size={14} className="text-indigo-400 animate-pulse" />
            <span>Real-Time Gateway Traffic Inspector ({logs.filter(l => l.type === 'metric').length})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTerminalPaused(!isTerminalPaused)}
              className="text-[10px] font-semibold text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded border border-slate-800"
            >
              {isTerminalPaused ? 'Resume logs' : 'Pause logs'}
            </button>
            <button
              onClick={() => setLogs([])}
              className="text-[10px] font-semibold text-slate-500 hover:text-rose-400 px-2 py-0.5 rounded border border-slate-800"
            >
              Clear Logs
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px] space-y-1 bg-slate-950/90 text-slate-400 scrollbar-thin">
          {logs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-700">
              No traffic streamed yet. Trigger routes to watch real-time gateway metrics...
            </div>
          ) : (
            logs.map((log, index) => {
              if (log.type === 'system') {
                return (
                  <div key={index} className="text-indigo-400/80 italic flex gap-2">
                    <span>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <span>⚙️ {log.message}</span>
                  </div>
                );
              }

              const statusColorClass = log.status >= 200 && log.status < 300 ? 'text-emerald-400' :
                log.status >= 300 && log.status < 500 ? 'text-amber-400 font-semibold' : 'text-rose-400 font-bold';

              return (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900/50 py-1 hover:bg-slate-900/30 px-1.5 rounded transition-all">
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-slate-600 select-none">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <span className={`px-1.5 py-0.25 rounded text-[8px] font-extrabold uppercase ${
                      log.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' : 'bg-sky-500/10 text-sky-400'
                    }`}>
                      {log.method}
                    </span>
                    <span className="font-semibold text-slate-200 truncate">{log.path}</span>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <span>Status: <strong className={statusColorClass}>{log.status}</strong></span>
                    <span>Latency: <strong className="text-indigo-400">{log.latency}ms</strong></span>
                    {log.error && <span className="text-rose-400 font-semibold">({log.error})</span>}
                  </div>
                </div>
              );
            })
          )}
          <div ref={terminalEndRef} />
        </div>
      </footer>

      {/* 1. DIALOG MODAL: CREATE PROJECT */}
      {isCreatingProject && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Create New Workspace</h3>
              <button onClick={() => setIsCreatingProject(false)} className="text-slate-400 hover:text-slate-200">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1.5">PROJECT NAME</label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Marketing Service API"
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1.5">DESCRIPTION</label>
                <input
                  type="text"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Contains lead generation pipelines"
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-2 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded-lg shadow transition-all"
              >
                Create Workspace Scope
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. DIALOG MODAL: CREATE GATEWAY ROUTE WORKFLOW */}
      {isCreatingWorkflow && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">New Routing Pipeline</h3>
              <button onClick={() => setIsCreatingWorkflow(false)} className="text-slate-400 hover:text-slate-200">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateWorkflow} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1.5">WORKFLOW NAME</label>
                <input
                  type="text"
                  required
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  placeholder="Fetch Customer Details"
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-2 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="text-[10px] text-slate-500 font-bold block mb-1.5">METHOD</label>
                  <select
                    value={newWorkflowMethod}
                    onChange={(e) => setNewWorkflowMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs font-bold rounded-lg px-2 py-2 focus:outline-none"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] text-slate-500 font-bold block mb-1.5">URL PATH</label>
                  <input
                    type="text"
                    required
                    value={newWorkflowPath}
                    onChange={(e) => setNewWorkflowPath(e.target.value)}
                    placeholder="/users/:id"
                    className="w-full bg-slate-950 border border-slate-850 text-slate-200 text-xs font-mono rounded-lg px-2.5 py-2 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded-lg shadow transition-all"
              >
                Initialize Pipeline Route
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
