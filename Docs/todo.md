# FlowForge Backend Development TODO List

This file tracks the implementation progress of the FlowForge backend server. Tasks are broken down by phases and individual modules.

---

## Progress Overview

- **Phase 1: Environment & Database Schema Setup** - `[x]` Completed
- **Phase 2: Authentication & Project/Workflow Management** - `[x]` Completed
- **Phase 3: Dynamic API Gateway & Sandbox execution** - `[x]` Completed
- **Phase 4: AST Compiler & Code Exporter (BullMQ/Redis)** - `[x]` Completed
- **Phase 5: WebSocket & Metrics Stream** - `[x]` Completed

---

## Detailed Checklist

### Phase 1: Environment & Database Schema Setup
- [x] **1.1 Setup Environment Configs**
  - [x] Add `.env` config file with DB URLs, Redis URL, JWT Secret, and Encryption Key.
  - [x] Implement environment variable validation service using `dotenv` and type guards in `src/config/`.
- [/] **1.2 Initialize Prisma ORM**
  - [x] Create `prisma/schema.prisma` file.
  - [x] Add `User`, `Project`, `Workflow`, `WorkflowVersion`, `GitConfiguration`, `GatewayConfig`, and `ExecutionLog` models.
  - [ ] Generate database migrations: `npx prisma migrate dev --name init`.
- [x] **1.3 Create Prisma DB Client Helper**
  - [x] Write a centralized Prisma client instance export in `src/index.ts` or a db service module.
  - [x] Test the database connection on server bootstrap.

---

### Phase 2: Authentication & Project/Workflow Management
- [x] **2.1 Implement User Authentication**
  - [x] Create user registration controller (`FR-1`) with password hashing using `bcryptjs`.
  - [x] Create user login controller (`FR-2`) returning signed JWT tokens.
  - [x] Set up JWT verification middleware hook in `src/middlewares/auth.ts` (`FR-3`, `FR-4`).
- [x] **2.2 Implement Project CRUD Routes**
  - [x] Create REST routes for projects (`FR-5`): Create, Read, Update, Delete, List.
  - [x] Add validation schemas for payload verification.
- [x] **2.3 Implement Workflow CRUD Routes**
  - [x] Create REST routes for workflows: Create, Read, Update, Delete, List.
  - [x] Add fields to save and load serialized React Flow compatible JSON graphs (nodes and edges).
  - [x] Implement workflow versioning system (`FR-8`) to save snapshots in the `WorkflowVersion` table.

---

### Phase 3: Dynamic API Gateway & Sandbox Execution
- [x] **3.1 Build secure VM Execution Sandbox**
  - [x] Write `src/services/sandbox.ts` utility using the native Node `vm` module.
  - [x] Enforce CPU execution constraints ($200\text{ms}$ timeout) and memory bounds ($64\text{MB}$ RAM limit) (timeout enforced via V8 script options).
  - [x] Cleanse the execution environment context (purge global handles like `process` or `require`).
- [x] **3.2 Build the Wildcard Gateway Route**
  - [x] Register wildcard route `ALL /api/:projectId/*` in `src/routes/gateway.ts`.
  - [x] Parse client request variables (body, query, params, headers) into execution context.
  - [x] Retrieve published workflow graphs matching the path and method from database.
- [x] **3.3 Implement Gatekeeping Middleware**
  - [x] Enforce JWT validation check if `requireJwt` is true in `GatewayConfig`.
  - [x] Implement rate-limiting checks based on `rateLimitLimit` and `rateLimitWindow` config.
- [x] **3.4 Implement Sequential Node Executor**
  - [x] Sort DAG nodes topologically to determine execution path.
  - [x] Execute steps sequentially:
    - **Trigger Node**: Capture input data.
    - **PostgreSQL Database Node**: Execute parameterized database queries based on inputs.
    - **Custom JS Node**: Run script in `node:vm` sandbox and map output variables.
    - **Response Node**: Return custom HTTP status code and body.
- [x] **3.5 Audit Trail Logging**
  - [x] Log gateway request history and latencies to `ExecutionLog` database table.

---

### Phase 4: AST Compiler & Code Exporter (BullMQ/Redis)
- [x] **4.1 Build Graph-to-Code AST Compiler**
  - [x] Implement templates to map visual nodes into equivalent TypeScript code blocks:
    - Trigger node $\to$ Fastify route declaration.
    - Database node $\to$ typed Prisma operations.
    - Custom JS node $\to$ isolated JS helper executions.
    - Response node $\to$ standard `reply.send()` statement.
  - [x] Generate configurations: `Dockerfile`, `docker-compose.yml`, `prisma/schema.prisma`, `tsconfig.json`.
- [x] **4.2 Set Up BullMQ & Redis Queue**
  - [x] Configure BullMQ client and Redis connection in `src/queue/exportQueue.ts`.
  - [x] Register an asynchronous compilation task queue.
- [x] **4.3 Implement Exporter Background Worker**
  - [x] Build a background worker that compiles the codebase, zips it using `archiver`, and registers download availability.
- [x] **4.4 Connect Git/GitHub Push Sync**
  - [x] Integrate `@octokit/rest` client for GitHub API communication.
  - [x] Implement commit and push module to directly write compiled files to remote repository branches (commits pushed using Git Trees database endpoints).

---

### Phase 5: WebSocket & Metrics Stream
- [x] **5.1 Setup Socket.IO Server**
  - [x] Attach `socket.io` to the Fastify instance in `src/websocket.ts` (decorated as `fastify.io`).
- [x] **5.2 Broadcast Gateway Metrics**
  - [x] Emit metrics payloads (latency, errors, success status) on completion of any gateway request.
  - [x] Restrict broadcasts to project-specific namespaces (`/project/:projectId`) for security (clients join project-scoped rooms).
