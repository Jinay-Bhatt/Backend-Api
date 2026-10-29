<p align="center">
  <img src="./frontend/public/logo.jpg" width="180" alt="JBSnap Logo" style="border-radius: 20px;" />
</p>

# 🚀 JBSnap

### *Build Visually. Compile Instantly. Own Your Code.*

> An open-source visual backend engineering platform and execution engine that compiles modular node pipelines into production-ready, standalone Fastify & TypeScript microservices — powered by **BharatCode AI (Qwen 3.8 27B)**.

---

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Fastify](https://img.shields.io/badge/Backend-Fastify%205-000000?style=for-the-badge&logo=fastify)](https://fastify.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20(Neon)-4169E1?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma%207-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![BharatCode AI](https://img.shields.io/badge/GenAI-BharatCode%20(Qwen%203.8%2027B)-FF9933?style=for-the-badge)](https://bharatcode.ai)
[![BullMQ](https://img.shields.io/badge/Task%20Queue-BullMQ%20+%20Redis-DC382D?style=for-the-badge&logo=redis)](https://bullmq.io/)
[![React Flow](https://img.shields.io/badge/Canvas-React%20Flow-FF0072?style=for-the-badge)](https://reactflow.dev/)

---

## 🚀 Overview

Most backend workflow builders and low-code tools lock developers into proprietary cloud runtimes, charging per-execution fees and making it impossible to migrate off their platform.

**JBSnap takes a fundamentally different approach.**

Instead of trapping your business logic inside a black-box hosted platform, JBSnap acts as both a **Visual API Designer** and a **Full-Stack Application Compiler**.

- Design REST endpoints, authentication barriers, database queries, and custom logic chains on a visual canvas.
- Describe full API workflows in natural language and have **BharatCode AI (Qwen 3.8 27B)** automatically synthesize the entire DAG graph with connected nodes, queries, and responses.
- Test endpoints live on canvas with the built-in **API Sandbox Test Runner**.
- Monitor executions dynamically via **Socket.IO sub-millisecond telemetry**.
- **Download 100% standard Fastify + Prisma + TypeScript source code** in a single click or push directly to GitHub.

The goal is simple:

> **Don't just mock workflows on someone else's cloud. Design visually, and own the production code.**

---

## 🎯 Problem

Traditional backend prototyping and workflow development suffers from severe friction:

- **Repetitive Boilerplate:** Developers spend hours writing boilerplate for routing, JWT auth guards, rate limiting, and CORS headers.
- **Vendor Lock-in:** Existing low-code tools (Zapier, n8n, Make) require you to run workflows on their servers and pay ongoing per-step execution costs.
- **Disconnected Prototyping:** Front-end and mobile teams wait for backend engineers to implement mock endpoints before they can start client work.
- **Painful Debugging:** Inspecting multi-step data transformations across services is cumbersome without a visual execution trace.
- **Zero Code Portability:** You cannot export workflows as clean, maintainable TypeScript projects ready for production Docker/Kubernetes deployment.

---

## 💡 Solution

JBSnap creates an end-to-end visual developer lifecycle:

```
  Natural Language Prompt  OR  Visual Drag-and-Drop Canvas
                           ↓
        AI Pipeline Synthesizer (BharatCode AI)
                           ↓
             Visual DAG Graph (12+ Node Types)
                           ↓
         Live Canvas API Sandbox (Real-time Testing)
                           ↓
         Isolated V8 VM Sandbox Runner (<0.2ms Latency)
                           ↓
         Socket.IO Telemetry & Latency Streaming
                           ↓
           AST Compiler & Zero-Lockin Exporter
                           ↓
       Standalone Fastify + TypeScript + Prisma ZIP
                           ↓
              1-Click GitHub Sync / Docker Run
```

---

## 🧠 How JBSnap Works

### 1. Natural Language to Workflow (BharatCode AI Synthesizer)
Provide a plain-English prompt:
> *"Create a user checkout endpoint with JWT validation, verify product inventory in PostgreSQL, charge via HTTP client, and return 201 Created with order receipt."*

JBSnap queries the **BharatCode Qwen 3.8 27B** model (`https://bharatcode.ai/api/model/v1`), which generates a mathematically validated Directed Acyclic Graph (DAG) with nodes, edges, queries, and response payloads configured.

### 2. Modular Visual Canvas (12+ Node Types)
Construct and customize pipelines using drag-and-drop primitives:
- **HTTP Trigger Node:** Entry point with configurable methods (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`) and route paths.
- **Webhook Node:** External event listener with cryptographic HMAC signature verification.
- **Scheduled Cron Node:** Automated background recurring tasks via standard cron expressions.
- **Auth Guard Node:** JWT RS256/HS256 claims validation and API key checking.
- **PostgreSQL / Neon Node:** Parameterized SQL queries preventing injection attacks.
- **Secure JS Sandbox Node:** Custom business logic executing in isolated V8 sandboxes with strict 200ms CPU timeouts.
- **If / Else & Switch Nodes:** Dynamic branching pipelines evaluating runtime conditions.
- **HTTP Client Node:** Outgoing API calls to third-party services with custom headers.
- **AI Integration Node:** Context-aware LLM reasoning blocks powered by BharatCode AI.
- **Email Automation Node:** Transactional emails with deep real-time DNS MX record checks.
- **Response Node:** Terminating node returning status codes, headers, and interpolated JSON payloads.

### 3. In-Memory DAG Cache (< 0.2ms Execution)
Published workflows are cached in RAM using Kahn's topological sort algorithm, enabling lightning-fast execution in less than `0.2ms` without database bottlenecks.

### 4. Real-Time Socket.IO Telemetry & Monitor
Watch live executions stream in real-time. Inspect request latencies, HTTP status codes, step-by-step node transition states, and error stack traces.

### 5. AST Compilation & Zero Lock-in Export
Click **Export Code** to compile the visual graph into a standalone **Fastify + Prisma + TypeScript** package.
- Download a compressed `.zip` bundle.
- Push directly to an existing or new GitHub repository via the integrated Octokit REST SDK.
- Run `npm install && npm run dev` on your own server or deploy directly with Docker.

---

## 📊 Comparison Matrix

| Dimension | Traditional Low-Code (n8n, Zapier) | Traditional Hand-Coding | 🚀 JBSnap Platform |
| :--- | :--- | :--- | :--- |
| **Development Speed** | Fast | Slow | **Blazing Fast (Visual + AI)** |
| **Code Ownership** | ❌ 0% (Platform locked) | ✅ 100% | **✅ 100% (Full TypeScript Export)** |
| **Execution Cost** | 💸 Per-step execution fees | ⚡ Infrastructure only | **⚡ Free & Self-Hosted** |
| **AI Integration** | Basic prompt blocks | Manual SDK wiring | **🇮🇳 BharatCode Qwen 3.8 27B Native** |
| **Testing** | External tools required | Unit tests / Postman | **⚡ Live In-Canvas Test Runner** |
| **Live Telemetry** | Polled logs | Datadog / Grafana setup | **📡 Real-Time Socket.IO Stream** |
| **Git / CI/CD** | Complex export scripts | Manual Git workflow | **🔄 1-Click GitHub Repository Push** |

---

## 🏗️ Architecture

```
                    ┌────────────────────────┐
                    │    Developer / User    │
                    └───────────┬────────────┘
                                │
                                ▼
                 ┌─────────────────────────────┐
                 │    Next.js 14 Visual App    │
                 │   (React Flow + Canvas)     │
                 └──────────────┬──────────────┘
                                │
                         REST & WebSocket
                                │
                                ▼
                 ┌─────────────────────────────┐
                 │   Fastify 5 Backend Gateway │
                 │  (Auth, Routing, Rate Limit)│
                 └───────┬───────┬───────┬─────┘
                         │       │       │
              ┌──────────┘       │       └──────────┐
              ▼                  ▼                  ▼
      ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
      │ Neon Postgres │  │ BullMQ Task   │  │ BharatCode AI │
      │  (Prisma ORM) │  │ Queue + Redis │  │ (Qwen 3.8 27B)│
      └───────────────┘  └───────────────┘  └───────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router) + React 19
- **Canvas Engine:** React Flow (`@xyflow/react`)
- **Styling:** Custom Vanilla CSS Design System with Neumorphic Tokens
- **Icons:** Lucide React (`lucide-react`)
- **Real-Time Client:** Socket.IO Client (`socket.io-client`)
- **Telemetry Charts:** Recharts (`recharts`)

### Backend
- **Framework:** Fastify v5 (Node.js v20+)
- **Language:** TypeScript 5+ (`tsx` runtime)
- **Database ORM:** Prisma ORM 7 (`@prisma/client`)
- **Database Engine:** PostgreSQL (Neon Serverless Cloud)
- **Task Queue:** BullMQ v5 + Redis (for asynchronous compilation jobs)
- **Sandboxed Execution:** Node.js `node:vm` with CPU time guards
- **Real-Time Server:** Socket.IO v4

### AI Engine (Sovereign LLM)
- **Primary Provider:** **BharatCode AI**
- **Model:** `qwen-3.8-27b` (BharatCode Qwen 3.8 27B)
- **Base Endpoint:** `https://bharatcode.ai/api/model/v1`
- **Supported Endpoints:** `/chat/completions` (OpenAI-compatible) and `/responses` (native)
- *Note:* Previous Groq and Ollama implementations remain preserved in the codebase as commented-out reference code.

### Security & DevOps
- **Security Headers:** `@fastify/helmet` (OWASP standards)
- **Anti-DDoS Firewall:** `@fastify/rate-limit` with automated IP bans
- **Cryptographic Encryption:** AES-256-GCM (Node `crypto`) for API credentials
- **Git SDK:** Octokit REST (`@octokit/rest`) for automated repository initialization

---

## 📁 Project Structure

```
Backend-Api/
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database models (User, Project, Workflow, etc.)
│   │   ├── seed.ts             # Demo data seeder
│   │   └── migrations/         # Prisma database migrations
│   ├── src/
│   │   ├── config/             # Environment validation & BharatCode config
│   │   ├── controllers/        # REST route handlers (auth, projects, workflows, services)
│   │   ├── middleware/         # Security headers & injection guards
│   │   ├── middlewares/        # JWT auth verification & AI rate limiters
│   │   ├── queue/              # BullMQ export queue & background workers
│   │   ├── routes/             # Fastify routes (ai, auth, gateway, git, health, projects)
│   │   ├── services/           # BharatCode AI synthesis, compiler, VM sandbox, DAG engine
│   │   ├── websocket.ts        # Socket.IO real-time event streaming
│   │   └── index.ts            # Fastify application entrypoint
│   ├── .env.example            # Backend environment template
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/
│   ├── public/                 # Static brand assets & icons
│   ├── src/
│   │   ├── app/                # Next.js App Router (builder, monitor, gateway, docs, dashboard)
│   │   ├── components/         # Custom React Flow nodes, modals, palettes
│   │   ├── context/            # React context providers
│   │   └── services/           # Typed API client with in-memory caching
│   ├── .env.example            # Frontend environment template
│   ├── tsconfig.json
│   └── package.json
│
├── Docs/                       # System documentation suite
│   ├── context.md              # Project context & architecture
│   ├── tech_stack.md           # Comprehensive technical stack guide
│   ├── testing_guide.md        # Step-by-step test runner procedures
│   ├── todo.md                 # Development roadmap & completed phases
│   └── PRD.md                  # Product Requirements Document
│
├── .env.example                # Monorepo environment configuration template
├── README.md                   # Project documentation & evaluation guide
└── package.json                # Monorepo management scripts
```

---

## ⚙️ Local Setup

### Prerequisites
Ensure you have the following installed:
- **Node.js**: v20+ recommended (v18+ minimum)
- **npm**: v9+
- **PostgreSQL**: Neon Cloud PostgreSQL or any PostgreSQL 14+ instance
- **Redis**: Local Redis server (`127.0.0.1:6379`) or cloud Redis URI
- **BharatCode API Key**: Obtainable from [bharatcode.ai](https://bharatcode.ai)

---

### Step-by-Step Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/Jinay-Bhatt/Backend-Api.git
cd Backend-Api
```

#### 2. Install All Dependencies
Install dependencies for the root, backend, and frontend with a single command:
```bash
npm run install-all
```

#### 3. Configure Environment Variables
Copy the `.env.example` file to create your `.env` in the root directory:
```bash
cp .env.example .env
```

Open `.env` and configure your credentials:
```env
PORT=5000
DATABASE_URL="postgresql://username:password@ep-example.region.neon.tech/neondb?sslmode=require"
REDIS_URL="redis://127.0.0.1:6379"
JWT_SECRET="your-super-secret-jwt-signing-key-min-32-chars"
ENCRYPTION_KEY="your-32-byte-hexadecimal-encryption-key"
FRONTEND_URL="http://localhost:3000"

# ── 🇮🇳 BHARATCODE AI (Qwen 3.8 27B) ───────────────────────────
AI_PROVIDER="bharatcode"
BHARATCODE_API_KEY="your-bharatcode-api-key-here"
BHARATCODE_BASE_URL="https://bharatcode.ai/api/model/v1"
BHARATCODE_MODEL="qwen-3.8-27b"
```

#### 4. Sync Database Schema
Initialize the database tables with Prisma:
```bash
npm run db:generate
npm run db:push
```

*(Optional: Seed presentation demo data)*
```bash
cd backend && npx tsx prisma/seed.ts && cd ..
```

#### 5. Launch the Application
Run both backend and frontend concurrently:
```bash
npm run dev
```

- **Frontend Client:** [http://localhost:3000](http://localhost:3000)
- **Backend API Server:** [http://localhost:5000](http://localhost:5000)
- **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔐 Environment Variables

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `PORT` | Yes | Fastify server listening port | `5000` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `REDIS_URL` | Yes | Redis connection string for task queues | `redis://127.0.0.1:6379` |
| `JWT_SECRET` | Yes | Secret string for signing auth tokens | `your-secret-key-32-chars` |
| `ENCRYPTION_KEY` | Yes | 32-byte key for AES-256 node secret encryption | `0123456789abcdef0123456789abcdef` |
| `AI_PROVIDER` | Yes | Active AI workflow synthesizer provider | `"bharatcode"` |
| `BHARATCODE_API_KEY` | **Yes** | API Key from BharatCode platform | `bc_live_...` |
| `BHARATCODE_BASE_URL` | Yes | BharatCode API base endpoint URL | `https://bharatcode.ai/api/model/v1` |
| `BHARATCODE_MODEL` | Yes | BharatCode model identifier | `qwen-3.8-27b` |
| `FRONTEND_URL` | Yes | CORS allowed origin | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Yes | Backend target URL for frontend client | `http://localhost:5000` |

---

## 🧪 Testing Flow

A complete verification walkthrough should cover:

- [ ] **Authentication:** Register a new account or sign in with Google OAuth / credentials.
- [ ] **Dashboard:** Verify the project overview and orbital system health monitors.
- [ ] **Visual Builder Canvas:** Drag-and-drop nodes from the palette (HTTP Trigger, Auth Guard, Database, Sandbox, Response).
- [ ] **AI Pipeline Synthesis:** Click **✨ AI Synthesize**, enter a prompt, and verify that **BharatCode AI (Qwen 3.8 27B)** automatically constructs the workflow.
- [ ] **Canvas Test Runner:** Click **⚡ TEST API**, provide a test payload, and verify instantaneous response execution.
- [ ] **Live Telemetry:** Open `/projects/:id/monitor` and watch real-time Socket.IO logs and execution latencies.
- [ ] **Service Mesh:** View the microservice dependency graph and link interactions.
- [ ] **1-Click TypeScript Export:** Click **Export Project** and download the compiled standalone Fastify ZIP.
- [ ] **GitHub CI/CD Sync:** Connect a GitHub repository and push the compiled code directly via Octokit.
- [ ] **Build Validation:** Run `npm run build` in root and verify both backend and frontend compile with 0 errors.

---

## 🔮 Future Scope

- 🌐 **Serverless Edge Targets:** One-click deployment targets for AWS Lambda, Cloudflare Workers, and Google Cloud Run.
- 👥 **Real-Time Multiplayer Canvas:** Multi-cursor collaboration using WebRTC and CRDTs for team design sessions.
- 📦 **Community Template Marketplace:** Share and import community-created workflow packs (Stripe subscriptions, Supabase sync, AI agent loops).
- 🛡️ **Advanced RBAC & Governance:** Granular canvas-level permissions and audit logging for enterprise organizations.
- 🤖 **Multi-Model Orchestration:** Chain multiple specialized LLMs (reasoning, code generation, summarization) within a single execution graph.

---

## 🏆 Hackathon Context

- **Track:** Coding & Developer Tools
- **Team Name:** `Brain Dead`
- **Team Members:**
  - **Bhavya Durgani** (GitHub: [BhavyaDurgani](https://github.com/BhavyaDurgani))
  - **Jinay Bhatt** (GitHub: [Jinay-Bhatt](https://github.com/Jinay-Bhatt))

---

### 🇮🇳 BharatCode AI Integration (Evaluator Quick-Check)

Hackathon evaluators can inspect the native BharatCode integration in the following files:

1. **AI Synthesis Pipeline:** [`backend/src/services/ai.ts`](file:///backend/src/services/ai.ts) — Sends prompts to `https://bharatcode.ai/api/model/v1/chat/completions` (with fallback to `/responses`) using Bearer auth and model `qwen-3.8-27b`.
2. **Runtime Gateway AI Node:** [`backend/src/routes/gateway.ts`](file:///backend/src/routes/gateway.ts) — Real-time execution handler for AI nodes targeting BharatCode.
3. **AST Code Compiler:** [`backend/src/services/compiler.ts`](file:///backend/src/services/compiler.ts) — Transpiles visual AI nodes into native BharatCode fetch calls inside standalone Fastify output packages.
4. **Visual Builder Modal:** [`frontend/src/app/projects/[id]/builder/page.tsx`](file:///frontend/src/app/projects/[id]/builder/page.tsx) — Displays `"POWERED BY BHARATCODE AI (QWEN 3.8 27B)"`.
5. **Environment Configuration:** [`.env`](file:///.env) & [`.env.example`](file:///.env.example) — Configured with `AI_PROVIDER="bharatcode"` and `BHARATCODE_API_KEY`.
*(All prior Groq and Ollama code implementations have been preserved as commented-out reference code).*
