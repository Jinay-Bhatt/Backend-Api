import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Play, Database, Code, Send } from "lucide-react";

// Helper for styling selected active nodes
const getSelectedClass = (selected?: boolean) =>
  selected
    ? "ring-2 ring-indigo-500/80 ring-offset-2 ring-offset-slate-950 shadow-[0_0_20px_rgba(99,102,241,0.25)] border-indigo-400"
    : "border-slate-800/80 hover:border-slate-700 shadow-xl";

/**
 * 1. Trigger Node Component
 */
export function TriggerNode({ data, selected }: any) {
  const method = data.method || "GET";
  const path = data.path || "/";

  const getMethodBadgeClass = (m: string) => {
    switch (m.toUpperCase()) {
      case "GET":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "POST":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "PUT":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "DELETE":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div
      className={`w-60 bg-slate-900/90 backdrop-blur-md border rounded-xl overflow-hidden text-left transition-all duration-200 ${getSelectedClass(
        selected
      )}`}
    >
      <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800/60 flex items-center gap-2">
        <div className="p-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <Play size={14} className="fill-emerald-400/20" />
        </div>
        <span className="text-xs font-semibold text-slate-200 tracking-wide">
          HTTP Request Trigger
        </span>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 border rounded-md text-[10px] font-bold uppercase ${getMethodBadgeClass(
              method
            )}`}
          >
            {method}
          </span>
          <span className="text-xs font-mono font-medium text-slate-300 truncate max-w-[130px]">
            {path}
          </span>
        </div>
        <p className="text-[10px] text-slate-500">
          Starts the request execution context.
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full hover:bg-emerald-400"
      />
    </div>
  );
}

/**
 * 2. Database Node Component
 */
export function DatabaseNode({ data, selected }: any) {
  const query = data.query || "SELECT * FROM users;";

  return (
    <div
      className={`w-60 bg-slate-900/90 backdrop-blur-md border rounded-xl overflow-hidden text-left transition-all duration-200 ${getSelectedClass(
        selected
      )}`}
    >
      <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800/60 flex items-center gap-2">
        <div className="p-1 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400">
          <Database size={14} />
        </div>
        <span className="text-xs font-semibold text-slate-200 tracking-wide">
          PostgreSQL Database Query
        </span>
      </div>
      <div className="p-4 space-y-2">
        <div className="bg-slate-950/80 border border-slate-850/50 rounded-lg p-2.5 font-mono text-[10px] text-sky-300 max-h-16 overflow-y-auto break-all scrollbar-thin scrollbar-thumb-slate-850">
          {query}
        </div>
        <p className="text-[10px] text-slate-500">
          Supports context parameters (e.g. $request.query.id).
        </p>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-sky-500 border-2 border-slate-900 rounded-full"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-sky-500 border-2 border-slate-900 rounded-full hover:bg-sky-400"
      />
    </div>
  );
}

/**
 * 3. Custom Code Node Component
 */
export function CustomCodeNode({ data, selected }: any) {
  const code = data.code || "return context.request.body;";

  return (
    <div
      className={`w-60 bg-slate-900/90 backdrop-blur-md border rounded-xl overflow-hidden text-left transition-all duration-200 ${getSelectedClass(
        selected
      )}`}
    >
      <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800/60 flex items-center gap-2">
        <div className="p-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <Code size={14} />
        </div>
        <span className="text-xs font-semibold text-slate-200 tracking-wide">
          Custom JS Sandbox
        </span>
      </div>
      <div className="p-4 space-y-2">
        <div className="bg-slate-950/80 border border-slate-850/50 rounded-lg p-2.5 font-mono text-[10px] text-amber-300 max-h-16 overflow-y-auto break-all scrollbar-thin scrollbar-thumb-slate-850">
          {code}
        </div>
        <p className="text-[10px] text-slate-500">
          Purged global variables, 200ms timeout lock.
        </p>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-amber-500 border-2 border-slate-900 rounded-full"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-amber-500 border-2 border-slate-900 rounded-full hover:bg-amber-400"
      />
    </div>
  );
}

/**
 * 4. Response Node Component
 */
export function ResponseNode({ data, selected }: any) {
  const statusCode = data.statusCode || 200;
  const body = data.body || "$steps.previousNodeId";

  const getStatusColorClass = (code: number) => {
    if (code >= 200 && code < 300) {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
    if (code >= 300 && code < 400) {
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
    return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  };

  return (
    <div
      className={`w-60 bg-slate-900/90 backdrop-blur-md border rounded-xl overflow-hidden text-left transition-all duration-200 ${getSelectedClass(
        selected
      )}`}
    >
      <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800/60 flex items-center gap-2">
        <div className="p-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <Send size={14} />
        </div>
        <span className="text-xs font-semibold text-slate-200 tracking-wide">
          JSON HTTP Response
        </span>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 border rounded-md text-[10px] font-bold ${getStatusColorClass(
              statusCode
            )}`}
          >
            {statusCode}
          </span>
          <span className="text-xs font-mono font-medium text-slate-400 truncate max-w-[140px]">
            {typeof body === "string" ? body : "Custom Object"}
          </span>
        </div>
        <p className="text-[10px] text-slate-500">
          Terminates pipeline, returns response.
        </p>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-indigo-500 border-2 border-slate-900 rounded-full hover:bg-indigo-400"
      />
    </div>
  );
}

// Export mapping to bind custom types in React Flow registries
export const nodeTypes = {
  triggerNode: TriggerNode,
  databaseNode: DatabaseNode,
  customCodeNode: CustomCodeNode,
  responseNode: ResponseNode,
};
