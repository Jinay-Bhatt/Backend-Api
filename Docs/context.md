# FlowForge Platform Context

This file serves as the single source of truth for the workspace context, tracking requirements, architecture, database schemas, and current work state.

---

## 1. Project Overview
FlowForge is an **Open Backend Development Platform** that enables users to visually design, secure, monitor, and deploy APIs, while maintaining full code ownership and infrastructure control. 

### Core Pillars
1. **Visual API Builder (React Flow)**: Drag-and-drop workflow canvas.
2. **Managed Execution Engine (Dynamic Runtime)**: Instantly run APIs via visual workflows with secure custom JavaScript execution.
3. **TypeScript Code Export Engine**: Zero vendor lock-in; exports standard, deployable Fastify + TypeScript + Prisma codebases.
4. **Git Sync & Self-Hosting**: Push exported code directly to GitHub/GitLab and run anywhere (Docker, Cloud, VPS).

---

## 2. Tech Stack Summary
* **Frontend**: Next.js, React Flow, ShadCN UI, Tailwind CSS, Recharts
* **Backend**: Node.js, Fastify, TypeScript, Prisma, Socket.IO, BullMQ
* **Database**: PostgreSQL (Neon / Supabase)
* **Hosting**: Vercel (Frontend), Railway / Render (Backend)

---

## 3. Documentation Index
All core project documentation is located inside the root `Docs/` directory:

| Document | Description | Path | Status |
| :--- | :--- | :--- | :--- |
| **Workspace Context** | This file; tracks workspace state and structure | [context.md](file:///c:/Users/jinay/OneDrive/Desktop/Backend-api/Docs/context.md) | **Active / Updating** |
| **Development TODO List** | Checklist of steps for each phase and module | [todo.md](file:///c:/Users/jinay/OneDrive/Desktop/Backend-api/Docs/todo.md) | **Created** |
| **Prerequisites Guide** | Foundations of backend, folder routing, database models | [Prequisite_for_backend.md](file:///c:/Users/jinay/OneDrive/Desktop/Backend-api/Docs/Prequisite_for_backend.md) | **Created** |
| **PRD** | Product Requirements Document | [PRD.md](file:///c:/Users/jinay/OneDrive/Desktop/Backend-api/Docs/PRD.md) | **Approved** |
| **SRS** | Software Requirements Specification | [SRS.md](file:///c:/Users/jinay/OneDrive/Desktop/Backend-api/Docs/SRS.md) | **Approved** |
| **Database Design** | PostgreSQL tables, Prisma schema, and relationship graph | [database_design.md](file:///c:/Users/jinay/OneDrive/Desktop/Backend-api/Docs/database_design.md) | **Approved** |
| **System Architecture** | System Design, execution flow, sandboxing, & compiler spec | [system_architecture.md](file:///c:/Users/jinay/OneDrive/Desktop/Backend-api/Docs/system_architecture.md) | **Approved** |
| **Baseline: Overview** | Original high-level platform summary | [FlowForge Overview.md](file:///c:/Users/jinay/OneDrive/Desktop/Backend-api/Docs/FlowForge%20Overview.md) | **Moved to Docs** |
| **Baseline: Req Spec** | Original functional requirements specifications | [FlowForge Requirements Specification.md](file:///c:/Users/jinay/OneDrive/Desktop/Backend-api/Docs/FlowForge%20Requirements%20Specification.md) | **Moved to Docs** |
| **Baseline: User Flows** | Original visual builder workflow diagrams | [FlowForge User Workflows.md](file:///c:/Users/jinay/OneDrive/Desktop/Backend-api/Docs/FlowForge%20User%20Workflows.md) | **Moved to Docs** |
| **Baseline: Deploy Spec** | Original deployment runtime & hosting description | [FlowForge Deployment & Hosting Architecture.md](file:///c:/Users/jinay/OneDrive/Desktop/Backend-api/Docs/FlowForge%20Deployment%20&%20Hosting%20Architecture.md) | **Moved to Docs** |

---

## 4. Folder Structure
```
Backend-api/
├── Docs/                              # Core design and documentation folder
│   ├── context.md                     # Current workspace context (Active)
│   ├── todo.md                        # Project task checklist (Active)
│   ├── Prequisite_for_backend.md      # Prerequisite knowledge and architecture guide
│   ├── PRD.md                         # Product Requirements Document
│   ├── SRS.md                         # Software Requirements Specification
│   ├── database_design.md             # DB design & schema specification
│   ├── system_architecture.md         # System Architecture & Compiler Spec
│   ├── FlowForge Overview.md          # Moved from root
│   ├── FlowForge Requirements Spec.md # Moved from root
│   ├── FlowForge User Workflows.md    # Moved from root
│   └── FlowForge Deployment Arch.md   # Moved from root
├── src/                               # Backend source code template
│   ├── routes/
│   │   └── health.ts                  # Backend health check endpoint
│   └── index.ts                       # Backend server entrypoint
├── frontend/                          # Next.js frontend application template
│   ├── src/
│   │   └── app/
│   │       ├── page.tsx               # Frontend connection dashboard
│   │       └── layout.tsx             # Frontend root layout
│   ├── next.config.ts                 # Next.js configurations
│   └── package.json                   # Frontend npm packages & scripts
├── tsconfig.json                      # Backend TypeScript configurations
├── package.json                       # Backend npm packages & scripts
└── package-lock.json
```

---

## 5. Current Milestones & Status
1. **Documentation Phase (Completed)**: Drafted PRD, SRS, Database Design, System Architecture, and Prerequisites inside the `/Docs` folder.
2. **Review & Approval (Completed)**: Visual specifications and PRD/SRS reviews completed and approved.
3. **Template Setup (Completed)**: Initialized Fastify + Next.js basic templates demonstrating local gateway connection.
4. **Development TODOs (Completed)**: Created `todo.md` to track implementation checklist across all phases.
5. **Database Model Setup (Completed)**: Configured Prisma schema, environment validation, database pool wrapper, and connected to Neon PostgreSQL (Phase 1).
6. **Dynamic Engine & Sandbox Runner (Completed)**: Implemented wildcard gateway router, Kahn's algorithm topological sorter, prepared SQL parameterizer, and node:vm script runner (Phase 3).
7. **AST Compiler & Code Exporter (Completed)**: Developed visual-to-TypeScript code compilation exporter and BullMQ background task runner (Phase 4).
8. **Git & Deploy Integrations (Completed)**: Implemented AES-256-GCM token encryption and Octokit repository commit push connector (Phase 4).
9. **WebSocket Metrics Stream (Completed)**: Configured Socket.IO room-isolated execution latency and error logging stream (Phase 5).
