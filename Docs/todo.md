# FlowForge Backend Development TODO List

This file tracks the implementation progress of the FlowForge backend server.

---

## Progress Overview

- **Phase 1: Environment & Database Schema Setup** - `[x]` Completed
- **Phase 2: Authentication & Project/Workflow Management** - `[x]` Completed
- **Phase 3: Dynamic API Gateway & Sandbox execution** - `[x]` Completed
- **Phase 4: AST Compiler & Code Exporter (BullMQ/Redis)** - `[x]` Completed
- **Phase 5: WebSocket & Metrics Stream** - `[x]` Completed
- **Phase 6: Analytics & Logs Backend** - `[x]` Completed
- **Phase 7: Services & Gateway Config** - `[x]` Completed
- **Phase 8: AI Workflow Generator (Groq/Ollama)** - `[x]` Completed
- **Phase 9: Frontend — Auth Pages** - `[x]` Completed
- **Phase 10: Frontend — Dashboard** - `[x]` Completed
- **Phase 11: Frontend — Builder (React Flow + AI Modal)** - `[x]` Completed
- **Phase 12: Frontend — Monitor (Live Logs)** - `[x]` Completed
- **Phase 13: Frontend — Analytics (Recharts)** - `[x]` Completed
- **Phase 14: Frontend — Gateway Settings** - `[x]` Completed
- **Phase 15: Frontend — Service Mesh** - `[x]` Completed
- **Phase 16: Frontend — Settings (Git Config)** - `[x]` Completed

---

## Detailed Checklist

### ✅ Phase 1: Environment & Database Schema Setup
- [x] `.env` config file with DB URLs, Redis URL, JWT Secret, Encryption Key
- [x] Environment variable validation in `src/config/index.ts`
- [x] `prisma/schema.prisma` — all 9 models defined
- [x] **NEW** `Analytics`, `Service`, `ServiceRoute` models added
- [x] **NEW** `GatewayConfig` extended with `requireApiKey`, `apiKeyValue`, `corsEnabled`, `allowedOrigins`
- [x] `npx prisma db push` — DB synced to Neon PostgreSQL ✅
- [x] Prisma client helper in `src/services/db.ts`

### ✅ Phase 2: Auth & Project/Workflow Management
- [x] Register / Login controllers with bcrypt + JWT
- [x] JWT middleware in `src/middlewares/auth.ts`
- [x] Projects CRUD
- [x] Workflows CRUD + versioning + publish/unpublish

### ✅ Phase 3: Dynamic API Gateway
- [x] Wildcard `ALL /api/:projectId/*` route
- [x] In-memory rate limiting
- [x] JWT enforcement per gateway config
- [x] VM sandbox executor (`node:vm`)
- [x] DAG topological sort + sequential node executor
- [x] **NEW** Switch Case branching node execution
- [x] **NEW** Outgoing HTTP Client node execution (REST API Integration)
- [x] **NEW** Live Background Cron Scheduler Engine (matchCron worker)
- [x] **NEW** Dynamic Response Headers & HTTP Redirects configuration
- [x] Execution audit log → `ExecutionLog` table
- [x] Socket.IO metrics stream

### ✅ Phase 4: AST Compiler & Code Export
- [x] `src/services/compiler.ts` — workflow JSON → Fastify TypeScript code
- [x] BullMQ export queue + Redis worker
- [x] ZIP archiver
- [x] GitHub push via Octokit
- [x] OpenAPI (Swagger) Spec dynamic generation (`swagger.ts` / `@fastify/swagger`)

### ✅ Phase 5: WebSocket Metrics Stream
- [x] Socket.IO attached to Fastify in `src/websocket.ts`
- [x] Project-scoped rooms
- [x] Metrics broadcast on every gateway request

### ✅ Phase 6: Analytics & Logs Backend
- [x] `src/controllers/analytics.ts` — daily trend, hourly heatmap, top routes, summary stats
- [x] `src/routes/analytics.ts`
- [x] `GET /projects/:id/analytics?range=7d|30d|24h`
- [x] `GET /projects/:id/logs?limit=&page=&status=`

### ✅ Phase 7: Services & Gateway Config
- [x] `src/controllers/services.ts` — Service CRUD, ServiceRoute CRUD, GatewayConfig upsert
- [x] `src/routes/services.ts`
- [x] `GET/POST/PUT/DELETE /projects/:id/services`
- [x] `POST /projects/:id/services/:serviceId/routes`
- [x] `GET/PUT /workflows/:workflowId/gateway-config`

### ✅ Phase 8: AI Workflow Generator
- [x] `src/services/ai.ts` — Groq / local Ollama integrations
- [x] `src/routes/ai.ts`
- [x] `POST /api/ai/generate-workflow`
- [x] Returns structured nodes + edges + metadata JSON

### ✅ Phase 9–16: Frontend (Next.js App Router)
- [x] Global CSS design system (`globals.css`)
- [x] Root layout + redirect page (redirects unauthenticated users to `/landing` first)
- [x] Landing page (`/landing`) — scroll-triggered animated Pipeline Reactor
- [x] Login page (`/login`) — connected glass pipeline inputs, no cards
- [x] Register page (`/register`) — matching glass pipeline inputs, no cards
- [x] Dashboard page (`/dashboard`) — API Constellation Orbit Map, orbital satellites, HUD panel, no cards
- [x] Project layout with tab navigation (`/projects/[id]/layout.tsx`)
- [x] Builder page with React Flow, AI modal, node palette (`/projects/[id]/builder`)
- [x] Monitor page with live Socket.IO log stream, row flashing, live pulse, and animated counters (`/projects/[id]/monitor`)
- [x] Analytics page with Recharts and animated metrics loaders (`/projects/[id]/analytics`)
- [x] Gateway config page with spring physics switches (`/projects/[id]/gateway`)
- [x] Service mesh page with ReactFlow graph (`/projects/[id]/services`)
- [x] Settings page with Git config + profile (`/settings`)
- [x] All 12 custom node components in `customNodes.tsx` (including Switch Case & HTTP Client)
- [x] Complete API client in `services/api.ts`

---

## Remaining Tasks
- [x] Add seed demo data for presentation (Seeded to Neon successfully via `prisma/seed.ts`)
- [ ] Configure GROQ_API_KEY or install local Ollama
- [ ] Deploy: Vercel (frontend) + Railway/Render (backend) + Neon (DB)
