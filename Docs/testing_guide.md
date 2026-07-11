# 🧪 FlowForge — Complete Testing Guide

> **Scope**: End-to-end manual test coverage for every feature, page, API endpoint, WebSocket stream, and edge case in the FlowForge platform.
>
> **Stack**: Next.js 14 Frontend (port 3000) · Fastify Backend (port 5000) · Neon PostgreSQL · BullMQ/Mock Queue · Socket.IO
>
> **Last Updated**: 2026-07-11

---

## 📋 Table of Contents

1. [Environment Setup](#1-environment-setup)
2. [Health & Public Endpoints](#2-health--public-endpoints)
3. [Authentication](#3-authentication)
4. [Landing Page](#4-landing-page)
5. [Dashboard](#5-dashboard)
6. [Project Management](#6-project-management)
7. [Workflow Builder](#7-workflow-builder)
8. [Services Registry](#8-services-registry)
9. [Gateway Configuration](#9-gateway-configuration)
10. [Live Monitor](#10-live-monitor)
11. [Analytics Page](#11-analytics-page)
12. [API Gateway Execution (Core Engine)](#12-api-gateway-execution-core-engine)
13. [Export & Compilation](#13-export--compilation)
14. [Settings Page](#14-settings-page)
15. [WebSocket Real-Time Stream](#15-websocket-real-time-stream)
16. [AI Workflow Generation](#16-ai-workflow-generation)
17. [Security & Edge Cases](#17-security--edge-cases)
18. [Rate Limiting](#18-rate-limiting)
19. [Docs Page](#19-docs-page)
20. [Other Static Pages](#20-other-static-pages)

---

## 1. Environment Setup

### 1.1 Prerequisites

| Tool | Version | Check Command |
|------|---------|---------------|
| Node.js | ≥ 18 | `node -v` |
| npm | ≥ 9 | `npm -v` |
| Redis (optional) | any | `redis-cli ping` → `PONG` |

### 1.2 Environment Variables

Confirm `.env` at root and `backend/.env` contain:

```env
PORT=5000
DATABASE_URL=<neon-postgres-url>
REDIS_URL=redis://127.0.0.1:6379
JWT_SECRET=<any-32-char-string>
ENCRYPTION_KEY=<64-char-hex>
AI_PROVIDER=auto
GROQ_API_KEY=<your-groq-key>
FRONTEND_URL=http://localhost:3000
```

### 1.3 Starting the Stack

```bash
# Terminal 1 — Backend
cd backend && npm run dev
# Expected: "🚀 FlowForge API server ready at http://localhost:5000"
# Look for: "✅ Database connection established successfully"

# Terminal 2 — Frontend
cd frontend && npm run dev
# Expected: "✓ Ready on http://localhost:3000"
```

### 1.4 Startup Verification Checklist

- [ ] Backend logs show `✅ Database connection established successfully`
- [ ] Backend logs show `📦 Compilation queue worker initialized`
- [ ] If Redis is **offline**: logs show `⚠ Redis offline — using Mock In-Memory Queue`
- [ ] If Redis is **online**: logs show `✅ Redis connected`
- [ ] Frontend compiles without errors at `http://localhost:3000`

---

## 2. Health & Public Endpoints

> **Tool**: Browser address bar or `curl`

### 2.1 Health Check

```
GET http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-07-11T...",
  "message": "FlowForge Backend Template is connected and running!"
}
```
- [ ] Status code: `200`
- [ ] `status` field equals `"ok"`
- [ ] `timestamp` is a valid ISO 8601 date

### 2.2 Public Stats

```
GET http://localhost:5000/api/public-stats
```

**Expected Response:**
```json
{
  "status": "success",
  "totalProjects": <number>,
  "totalWorkflows": <number>,
  "totalRequests": <number>,
  "avgLatency": <number>
}
```
- [ ] Status code: `200`
- [ ] All numeric fields are ≥ 0
- [ ] This is the data source for the landing page stats section

---

## 3. Authentication

### 3.1 Registration

**URL**: `http://localhost:3000/register`

#### 3.1.1 Happy Path
- [ ] Navigate to `/register`
- [ ] Enter a **new** email: `testuser@flowforge.dev`
- [ ] Enter username: `TestUser`
- [ ] Enter password: `SecurePass123!`
- [ ] Click **Create Account**
- [ ] **Expected**: Redirected to `/dashboard`
- [ ] **Expected**: JWT token stored in `localStorage` as `ff_token`
- [ ] **Expected**: User object stored in `localStorage` as `ff_user`

#### 3.1.2 Duplicate Email
- [ ] Attempt to register again with the **same email**
- [ ] **Expected**: Error message shown (`"User already exists"` or similar)
- [ ] **Expected**: No redirect, stays on `/register`

#### 3.1.3 API Validation
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json
Body: {}   ← empty
```
- [ ] **Expected**: `400 Bad Request`

#### 3.1.4 Rate Limit
- [ ] Attempt to register 6 times rapidly (the rate limiter kicks in)
- [ ] **Expected**: Eventually receives `429 Too Many Requests`

---

### 3.2 Login

**URL**: `http://localhost:3000/login`

#### 3.2.1 Happy Path
- [ ] Enter previously registered email and password
- [ ] Click **Sign In**
- [ ] **Expected**: Redirected to `/dashboard`
- [ ] **Expected**: `ff_token` present in `localStorage`

#### 3.2.2 Wrong Password
- [ ] Enter correct email, wrong password
- [ ] **Expected**: Error shown (`"Invalid credentials"`)
- [ ] **Expected**: No redirect

#### 3.2.3 Non-existent Email
- [ ] Enter `nobody@flowforge.dev`
- [ ] **Expected**: Error shown

#### 3.2.4 Empty Fields
- [ ] Leave email empty and click Sign In
- [ ] **Expected**: HTML5 `required` validation or error message

---

### 3.3 Protected Routes (Auth Guard)

- [ ] Open incognito browser (no token)
- [ ] Navigate to `http://localhost:3000/dashboard` directly
- [ ] **Expected**: Redirected to `/login`
- [ ] Navigate to `http://localhost:3000/settings` directly
- [ ] **Expected**: Redirected to `/login`

---

### 3.4 Get Current User (API)

```
GET http://localhost:5000/api/auth/me
Authorization: Bearer <your-jwt-token>
```
- [ ] **Expected**: `200` with `{ id, email, username, ... }`
- [ ] Without token → **Expected**: `401 Unauthorized`

---

## 4. Landing Page

**URL**: `http://localhost:3000`

### 4.1 Hero Section
- [ ] Page loads without errors
- [ ] FlowForge logo visible in the header/title tab (favicon)
- [ ] **"Get Started Free"** CTA button → navigates to `/register`
- [ ] **"Watch Demo"** CTA button → scrolls to demo section and auto-plays the animation
- [ ] GitHub link in navbar → opens `https://github.com/Jinay-Bhatt/Backend-Api` in a new tab

### 4.2 Live Stats (Real Data)
- [ ] Stats cards (Total Projects, Workflows, Requests, Avg Latency) show real numbers fetched from `/api/public-stats`
- [ ] Numbers animate on first load (counter animation)
- [ ] Numbers are **not** hardcoded zeros

### 4.3 Real-Time Analytics Bento Card
- [ ] "Active Connections" counter in the bento section updates in real time via Socket.IO
- [ ] Bar chart in the bento card animates/updates when API gateway requests are made
- [ ] When no requests are made for 8 seconds, bars gently simulate idle movement

### 4.4 Capabilities Grid
- [ ] All 6 capability cards render without empty slots or layout breaks
- [ ] Grid is responsive: on narrow viewport the cards stack vertically

### 4.5 Footer Links
- [ ] **Documentation** → navigates to `/docs`
- [ ] **GitHub** → opens `https://github.com/Jinay-Bhatt/Backend-Api`
- [ ] **About** → navigates to `/about`
- [ ] **Changelog** → navigates to `/changelog`
- [ ] **Contact** → navigates to `/contact`

---

## 5. Dashboard

**URL**: `http://localhost:3000/dashboard` (requires login)

### 5.1 Stat Cards
- [ ] **Active Pipelines** shows correct count of published workflows across all projects
- [ ] **Live Endpoints** shows count of live endpoints
- [ ] **Projects** shows correct total project count
- [ ] **Uptime** shows uptime percentage
- [ ] AnimCounter counts smoothly from 0 to real value (uses `requestAnimationFrame`)

### 5.2 Project List
- [ ] All projects belonging to the logged-in user are displayed
- [ ] Each project card shows: name, description, endpoint/workflow count badge
- [ ] Clicking a project card navigates to `/projects/[id]/builder`

### 5.3 Create Project Modal
- [ ] Click **+ New Project** button
- [ ] Modal opens with Name and Description fields
- [ ] Both **Cancel** and **Create Project** buttons have proper height (≥38px)
- [ ] **Cancel** closes the modal without creating a project
- [ ] Leave name empty, click Create — **Expected**: validation error / button disabled
- [ ] Fill name `My Test API` and description, click **Create Project**
- [ ] **Expected**: Modal closes, new project card appears in list immediately
- [ ] **Expected**: Success toast or feedback shown

### 5.4 System Health Panel
- [ ] CPU, Memory, Uptime metrics display (via scheduler heartbeat)
- [ ] Latency and request aggregate stats visible

---

## 6. Project Management

### 6.1 API — Create Project

```
POST http://localhost:5000/api/projects
Authorization: Bearer <token>
Content-Type: application/json
{
  "name": "My Test Project",
  "description": "Testing FlowForge"
}
```
- [ ] **Expected**: `201` with `{ id, name, description, ownerId, ... }`

### 6.2 API — List Projects

```
GET http://localhost:5000/api/projects
Authorization: Bearer <token>
```
- [ ] **Expected**: `200` with array of projects
- [ ] Each project includes `workflows` array (for pipeline count)

### 6.3 API — Get Single Project

```
GET http://localhost:5000/api/projects/:id
Authorization: Bearer <token>
```
- [ ] **Expected**: `200` with project object
- [ ] With wrong `id` → **Expected**: `404`

### 6.4 API — Delete Project

```
DELETE http://localhost:5000/api/projects/:id
Authorization: Bearer <token>
```
- [ ] **Expected**: `200` or `204`
- [ ] Project no longer appears in list

### 6.5 Authorization Isolation
- [ ] Log in as **User A**, create a project → note its `id`
- [ ] Log in as **User B**, attempt `GET /api/projects/:id` with User B's token
- [ ] **Expected**: `403 Forbidden` or `404 Not Found` (no cross-user access)

---

## 7. Workflow Builder

**URL**: `http://localhost:3000/projects/[id]/builder`

### 7.1 Canvas Load
- [ ] Builder page loads without errors
- [ ] Visual node canvas renders
- [ ] Existing workflows (if any) appear in the left sidebar list

### 7.2 Create New Workflow (Modal)
- [ ] Click **+ New Workflow** button
- [ ] Modal opens with fields: Name, Route (e.g. `/users`), REST Method
- [ ] **Cancel** button has `height: 38px` and `border-radius: 8px`
- [ ] **Deploy Workflow** button has `height: 38px` and `border-radius: 8px`
- [ ] Leave name empty → button should be disabled / show validation
- [ ] Fill: Name `Get Users`, Route `/users`, Method `GET`
- [ ] Click **Deploy Workflow**
- [ ] **Expected**: Workflow appears in sidebar, modal closes

### 7.3 Node Palette (Adding Nodes)
Test adding each available node type to the canvas:

| Node Type | Expected Behavior |
|-----------|-------------------|
| HTTP Request | Adds HTTP step with URL/method config |
| Transform (JS) | Adds JS transform step with code editor |
| SQL Query | Adds SQL node with connection string fields |
| Condition (If/Else) | Adds branching node |
| Response | Adds terminal response node |
| Rate Limiter | Adds rate-limit config node |

- [ ] Each node type can be dragged or clicked to add to canvas
- [ ] Node appears on canvas with its label and icon
- [ ] Node is selectable (click highlights it)

### 7.4 Node Configuration Panel
- [ ] Click a node → config panel appears on the right sidebar
- [ ] Changing a field value updates the node's `data` in the canvas
- [ ] **HTTP Request node**: Fields `url`, `method`, `headers`, `body` editable
- [ ] **Transform node**: Code editor accepts JavaScript
- [ ] **SQL node**: `connectionString` and `query` fields editable

### 7.5 Connecting Nodes (Edges)
- [ ] Drag from one node's output handle → connect to another node's input handle
- [ ] Edge (arrow) appears between nodes
- [ ] Can create multi-step DAG: HTTP → Transform → Response

### 7.6 Save Workflow
- [ ] After adding/modifying nodes and edges, click **Save** (or equivalent)
- [ ] **Expected**: Node layout persists on page refresh
- [ ] API call made to `PUT /api/workflows/:id`

### 7.7 Publish Workflow
- [ ] Click **Publish** on an existing workflow
- [ ] **Expected**: Workflow `isPublished` flag becomes `true`
- [ ] API call: `POST /api/workflows/:id/publish`
- [ ] Only published workflows are reachable via the gateway

### 7.8 Delete Workflow
- [ ] Delete a workflow from the sidebar
- [ ] **Expected**: Workflow removed from sidebar
- [ ] **Expected**: API call `DELETE /api/workflows/:id`

### 7.9 Version Snapshot
- [ ] Click **Create Version** (if available in UI)
- [ ] **Expected**: API call `POST /api/workflows/:id/version`
- [ ] Version saved with current node/edge layout as a snapshot

---

## 8. Services Registry

**URL**: `http://localhost:3000/projects/[id]/services`

### 8.1 List Services
- [ ] Page loads and fetches existing services from `GET /api/projects/:id/services`
- [ ] Each service card shows: name, base URL, description, registered routes

### 8.2 Register a New Service (Modal)
- [ ] Click **+ Register Service** button
- [ ] Modal opens with fields: Name, Base URL, Description
- [ ] **Cancel** button has `height: 38px` and `border-radius: 8px`
- [ ] **Register Service** button has `height: 38px` and `border-radius: 8px`
- [ ] Fill: Name `User Service`, Base URL `http://localhost:4001`, Description `Handles users`
- [ ] Click **Register Service**
- [ ] **Expected**: Service card appears in list, modal closes

### 8.3 Add Route to a Service
- [ ] Click **+ Add Route** on a service card
- [ ] Enter route path `/users` and method `GET`
- [ ] Click save
- [ ] **Expected**: Route appears inside the service card

### 8.4 Delete Service Route
- [ ] Click delete/trash icon on a route
- [ ] **Expected**: Route removed from the service
- [ ] API call: `DELETE /api/projects/:id/services/:serviceId/routes/:routeId`

### 8.5 Delete Service
- [ ] Click delete on a service card
- [ ] **Expected**: Service removed from list
- [ ] API call: `DELETE /api/projects/:id/services/:serviceId`

### 8.6 API Validation
```
POST http://localhost:5000/api/projects/:id/services
Authorization: Bearer <token>
Body: {} ← empty
```
- [ ] **Expected**: `400 Bad Request`

---

## 9. Gateway Configuration

**URL**: `http://localhost:3000/projects/[id]/gateway`

### 9.1 Load Config for a Workflow
- [ ] Page loads and populates the workflow selector dropdown with available workflows
- [ ] Selecting a workflow loads its current gateway config
- [ ] API call: `GET /api/workflows/:workflowId/gateway-config`

### 9.2 JWT Protection Toggle
- [ ] Toggle **Require JWT** to ON
- [ ] Click **Save Config**
- [ ] API call: `PUT /api/workflows/:workflowId/gateway-config`
- [ ] **Expected**: `{ requireJwt: true }` saved
- [ ] Re-select the workflow → toggle should still be ON (persisted)

### 9.3 API Key Protection Toggle
- [ ] Toggle **Require API Key** to ON
- [ ] Set API Key value in the text field
- [ ] Save
- [ ] **Expected**: API key saved (encrypted in DB)

### 9.4 Rate Limiting Config
- [ ] Set **Rate Limit** to `10` requests per `60` seconds
- [ ] Save
- [ ] **Expected**: Config saved with `rateLimitLimit: 10, rateLimitWindow: 60`
- [ ] Verified by sending >10 requests to the gateway in 60s → should get `429`

### 9.5 CORS Config
- [ ] Toggle **CORS Enabled** OFF
- [ ] Save
- [ ] **Expected**: `corsEnabled: false` in DB
- [ ] Toggle **CORS Enabled** ON, set **Allowed Origins** to `https://myapp.com`
- [ ] Save and verify persistence

---

## 10. Live Monitor

**URL**: `http://localhost:3000/projects/[id]/monitor`

### 10.1 Historical Logs (from DB)
- [ ] Page loads and fetches existing execution logs from `GET /api/projects/:id/logs`
- [ ] Log entries show: timestamp, method, route, status code, latency
- [ ] Status colors: green (2xx), amber (4xx), red (5xx)

### 10.2 Live Stream (Socket.IO)
- [ ] Log entries arrive in real time as gateway requests are made (see Section 12)
- [ ] New logs appear at the top of the list without page refresh
- [ ] Live pulse bar (shimmer animation) runs while not paused

### 10.3 Pause / Resume
- [ ] Click **Pause** button
- [ ] Trigger a gateway request
- [ ] **Expected**: No new log entries appear while paused
- [ ] Click **Resume**
- [ ] **Expected**: Live stream resumes and new logs appear

### 10.4 Filter Controls
- [ ] Select filter: **Success** → only 2xx logs shown
- [ ] Select filter: **Error** → only 4xx/5xx logs shown
- [ ] Select filter: **All** → all logs shown

### 10.5 Clear Logs
- [ ] Click **Clear** button
- [ ] **Expected**: Log display cleared (local UI clear, does not delete DB records)

### 10.6 Animated Counters
- [ ] Stat counters (Total Requests, Avg Latency, Error Rate) animate from 0 to real values
- [ ] Counters update in real time as new requests come in

---

## 11. Analytics Page

**URL**: `http://localhost:3000/projects/[id]/analytics`

### 11.1 Data Load
- [ ] Page loads and fetches analytics from `GET /api/projects/:id/analytics`
- [ ] Charts/graphs appear with real data

### 11.2 Metrics Displayed
- [ ] Total request count
- [ ] Latency distribution (if charted)
- [ ] Error rate
- [ ] Requests over time breakdown by workflow/route

### 11.3 No Data State
- [ ] If no execution logs exist for the project, empty/zero state is shown cleanly (no crash)

---

## 12. API Gateway Execution & Canvas Node Integration

> This section covers step-by-step UI actions, node placement, configuration parameters, and exact API validations for every node type in the FlowForge visual engine.

---

### 12.1 Node Placement & Connecting (General Canvas Rules)
- **Spawn Node**: Click any node block in the left sidebar palette under `NODE TELEMETRY` (e.g., Click `HTTP CLIENT`, `DATABASE QUERY`, etc.). It spawns at a default offset on the canvas.
- **Select Node**: Click on the spawned node to open its configuration form on the right sidebar panel (`⚙️ NODE CONFIG`).
- **Connect Nodes**: Click and drag from the circular circular handle on the right side of the source node (`Output`) to the circular handle on the left side of the target node (`Input`). A light blue, animated dynamic link line will connect them.
- **Save Work**: Click the white **SAVE** button in the top center toolbar.
- **Publish Work**: Click the **INITIALIZE** button in the top center toolbar. The label will change to a red **SUSPEND** button and display a green `● LIVE` badge.

---

### 12.2 Setup Workspace Project
1. Go to the dashboard (`http://localhost:3000/dashboard`).
2. Click **+ New Project**. Enter name: `Gateway Test`, description: `End-to-End Node Testing`, click **Create Project**.
3. In the project sidebar/builder canvas page (`http://localhost:3000/projects/[id]/builder`), click the `+` button next to `ACTIVE ROUTES` in the left sidebar.
4. Enter Name: `Test Pipeline`, Route: `/run-test`, select Method: `POST` (or GET as needed), then click **Deploy Workflow**.

---

### 12.3 Testing Node: Response Node (Base Workflow)
*Verify the canvas can receive a basic mock JSON response.*

1. **Add Nodes**: Click `RESPONSE` under `UTILITY NODES` in the palette.
2. **Setup Route Method**: Select the default `TRIGGER` node. In `⚙️ NODE CONFIG`, ensure Method is `POST` and Path is `/run-test`.
3. **Connect Nodes**: Connect the `TRIGGER` node output to the `RESPONSE` node input.
4. **Configure Response Node**:
   - Click the `RESPONSE` node.
   - Set **Status Code** input: `200`
   - Set **Body (use $steps.nodeId to reference)**:
     ```json
     {
       "status": "success",
       "message": "Response Node executed successfully",
       "received": "$request.body"
     }
     ```
   - Leave **Headers** and **Redirect URL** blank.
5. **Save & Publish**: Click **SAVE**, then click **INITIALIZE**.
6. **Trigger Validation API**:
   ```bash
   curl -X POST http://localhost:5000/api/<projectId>/run-test \
     -H "Content-Type: application/json" \
     -d '{"testKey": "testVal"}'
   ```
   **Expected Response (200 OK)**:
   ```json
   {
     "status": "success",
     "message": "Response Node executed successfully",
     "received": {
       "testKey": "testVal"
     }
   }
   ```
- [ ] Status code is 200.
- [ ] Output displays the sent payload under the `received` attribute.
- [ ] Request shows up on the [Live Monitor](file:///c:/Users/bhavy/OneDrive/Documents/Backend-Api/frontend/src/app/projects/%5Bid%5D/monitor/page.tsx) telemetry list.

---

### 12.4 Testing Node: HTTP Request (HTTP Client) Node
*Verify that the engine can route and proxy upstream third-party APIs.*

1. **Delete Existing Response Link**: Click the link line between `TRIGGER` and `RESPONSE` node. Press `Delete` key on your keyboard to clear it, or click the `Delete` button next to the node (if selecting a node).
2. **Add Node**: Click `HTTP CLIENT` under `INTEGRATION NODES` in the palette.
3. **Configure HTTP Client Node**:
   - Click the new `httpClientNode` on canvas.
   - Set Method: `GET`
   - Set **URL**: `https://jsonplaceholder.typicode.com/posts/1`
   - Set **Headers**:
     ```json
     {
       "Accept": "application/json"
     }
     ```
   - Leave **Body** empty.
4. **Connect Nodes**:
   - Link `TRIGGER` output $\rightarrow$ `httpClientNode` input.
   - Link `httpClientNode` output $\rightarrow$ `RESPONSE` node input.
5. **Update Response Node**:
   - Note the telemetry ID of the HTTP client node (e.g. `node_171540...` shown in the top blue header of the config panel). Let's call it `<httpNodeId>`.
   - Click `RESPONSE` node. Change the **Body** field to:
     ```json
     {
       "proxyData": "$steps.<httpNodeId>.body"
     }
     ```
6. **Save & Publish**: Click **SAVE**, then click **INITIALIZE** (or ensure it is active).
7. **Trigger Validation API**:
   ```bash
   curl -X POST http://localhost:5000/api/<projectId>/run-test
   ```
   **Expected Response (200 OK)**:
   ```json
   {
     "proxyData": {
       "userId": 1,
       "id": 1,
       "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
       "body": "quia et suscipit\nsuscipit recusandae..."
     }
   }
   ```
- [ ] The API successfully proxies the title and body attributes from JSONPlaceholder.
- [ ] Upstream API duration is tracked as part of the total latency inside the Live Monitor logs.

---

### 12.5 Testing Node: JavaScript Transform Node
*Verify that the virtual machine sandbox handles mapping scripts correctly.*

1. **Delete Link**: Remove the link going from `httpClientNode` to `RESPONSE` node.
2. **Add Node**: Click `TRANSFORM` under `PROCESSING NODES` in the palette.
3. **Configure Transform Node**:
   - Click the transform node.
   - Note its ID: `<transformNodeId>` (e.g., `node_transform_abc`).
   - Paste mapping script in **Mapping (JS object)**:
     ```javascript
     {
       id: steps.<httpNodeId>.body.id,
       titleUppercase: steps.<httpNodeId>.body.title.toUpperCase(),
       timestamp: Date.now()
     }
     ```
4. **Connect Nodes**:
   - Connect `httpClientNode` output $\rightarrow$ Transform node input.
   - Connect Transform node output $\rightarrow$ `RESPONSE` node input.
5. **Configure Response Node**:
   - Click `RESPONSE` node. Update the **Body** configuration to:
     ```json
     "$steps.<transformNodeId>"
     ```
6. **Save & Publish**: Click **SAVE**, then click **INITIALIZE**.
7. **Trigger Validation API**:
   ```bash
   curl -X POST http://localhost:5000/api/<projectId>/run-test
   ```
   **Expected Response (200 OK)**:
   ```json
   {
     "id": 1,
     "titleUppercase": "SUNT AUT FACERE REPELLAT PROVIDENT OCCAECATI EXCEPTURI OPTIO REPREHENDERIT",
     "timestamp": 1715404800000
   }
   ```
- [ ] Title is completely uppercase.
- [ ] Timestamp is generated by the JS runtime.

---

### 12.6 Testing Node: SQL Query Node
*Verify database adapters can execute custom queries.*

1. **Clear Intermediate Nodes**: Delete `httpClientNode` and `transformNode` from the canvas using the **DELETE** button in their settings panel.
2. **Add Node**: Click `SQL QUERY` under `DATA NODES` in the palette.
3. **Configure SQL Node**:
   - Click the database node. Note its ID: `<dbNodeId>`.
   - Set **SQL Query**:
     ```sql
     SELECT 
       $request.body.val as value_provided,
       NOW() as db_time
     ```
4. **Connect Nodes**:
   - Connect `TRIGGER` output $\rightarrow$ SQL node input.
   - Connect SQL node output $\rightarrow$ `RESPONSE` node input.
5. **Update Response Node**:
   - Click `RESPONSE` node. Set **Body**:
     ```json
     {
       "dbResult": "$steps.<dbNodeId>.rows[0]"
     }
     ```
6. **Save & Publish**: Click **SAVE**, then click **INITIALIZE**.
7. **Trigger Validation API**:
   ```bash
   curl -X POST http://localhost:5000/api/<projectId>/run-test \
     -H "Content-Type: application/json" \
     -d '{"val": 999}'
   ```
   **Expected Response (200 OK)**:
   ```json
   {
     "dbResult": {
       "value_provided": 999,
       "db_time": "2026-07-11T..."
     }
   }
   ```
- [ ] Database returns rows matching parameter replacement query inputs.
- [ ] Dynamic database dates display standard ISO output.

---

### 12.7 Testing Node: Condition (If/Else) Node
*Verify conditional branching logic.*

1. **Remove Link**: Disconnect SQL Node from `RESPONSE` node.
2. **Add Node**: Click `CONDITION (IF/ELSE)` under `CONTROL FLOW` in the palette.
3. **Configure Condition Node**:
   - Click the condition node.
   - In **Condition (JS expression)** field, enter:
     ```javascript
     context.request.body.score >= 50
     ```
4. **Add a second Response Node**:
   - Click `RESPONSE` in palette to spawn another response node. Let's call it `RESPONSE_TRUE` and `RESPONSE_FALSE`.
   - Click `RESPONSE_TRUE` (connected to True branch handle) $\rightarrow$ Set Body:
     ```json
     { "outcome": "PASS" }
     ```
   - Click `RESPONSE_FALSE` (connected to False branch handle) $\rightarrow$ Set Body:
     ```json
     { "outcome": "FAIL" }
     ```
5. **Connect Nodes**:
   - Link `TRIGGER` output $\rightarrow$ Condition input handle.
   - Link Condition `True` handle (usually labeled/color-coded or the top/bottom branch pin) $\rightarrow$ `RESPONSE_TRUE` input.
   - Link Condition `False` handle $\rightarrow$ `RESPONSE_FALSE` input.
6. **Save & Publish**: Click **SAVE**, then click **INITIALIZE**.
7. **Trigger Validation API (Condition: True)**:
   ```bash
   curl -X POST http://localhost:5000/api/<projectId>/run-test \
     -H "Content-Type: application/json" \
     -d '{"score": 85}'
   ```
   **Expected Response**: `{ "outcome": "PASS" }`

8. **Trigger Validation API (Condition: False)**:
   ```bash
   curl -X POST http://localhost:5000/api/<projectId>/run-test \
     -H "Content-Type: application/json" \
     -d '{"score": 30}'
   ```
   **Expected Response**: `{ "outcome": "FAIL" }`

- [ ] Route forks correctly between separate response payloads based on body values.

---

### 12.8 Dynamic Route Parameter Support
1. Select the `TRIGGER` node.
2. Change the Path property in `⚙️ NODE CONFIG` to: `/users/:userId/details`
3. Click `RESPONSE` node, configure **Body** to:
   ```json
   {
     "requestedUser": "$request.params.userId"
   }
   ```
4. **Save & Publish**.
5. Trigger:
   ```bash
   curl -X GET http://localhost:5000/api/<projectId>/users/1024/details
   ```
   **Expected Response**: `{ "requestedUser": "1024" }`
- [ ] Router maps URL segments to `$request.params` namespace values correctly.

---

### 12.9 Rate Limiting Node
1. Spawn the `RATE LIMITER` node from `CONTROL FLOW`.
2. Connect `TRIGGER` $\rightarrow$ `RATE LIMITER` $\rightarrow$ `RESPONSE`.
3. Select `RATE LIMITER`. In configuration sidebar, enter limit: `2` and window (seconds): `5`.
4. Save and initialize.
5. Trigger calls rapidly. The 3rd request must return `429 Too Many Requests`.

---

---

## 13. Export & Compilation

**URL**: `http://localhost:3000/settings` (Export tab) or API directly

### 13.1 Trigger Export (API)

```
POST http://localhost:5000/api/projects/:id/export
Authorization: Bearer <token>
Content-Type: application/json
{ "pushToGit": false }
```
- [ ] **Expected**: `202 Accepted` with `{ jobId: "...", message: "Compilation exporter task queued successfully" }`

### 13.2 Check Export Status

```
GET http://localhost:5000/api/projects/:id/export/status/:jobId
Authorization: Bearer <token>
```
- [ ] **Expected**: `{ id, state, progress, ... }`
- [ ] `state` cycles: `waiting` → `active` → `completed`
- [ ] After completion, `state === "completed"`

### 13.3 Download Compiled ZIP

```
GET http://localhost:5000/api/projects/:id/export/download
Authorization: Bearer <token>
```
- [ ] **Expected**: File download begins
- [ ] File extension: `.zip`
- [ ] ZIP contains a generated Fastify backend project

### 13.4 Download Before Compile (Error Case)

- [ ] Try to download before triggering export
- [ ] **Expected**: `404` with `"ZIP codebase package has not been compiled yet"`

### 13.5 Push to Git (with Git Config set)

```
POST http://localhost:5000/api/projects/:id/export
Authorization: Bearer <token>
{ "pushToGit": true }
```
- [ ] If Git config is set (see Section 14.3), compiled code is pushed to GitHub
- [ ] **Expected**: `202` with job queued

### 13.6 Unauthorized Export

- [ ] Use User B's token on User A's project
- [ ] **Expected**: `404` (not found / unauthorized)

---

## 14. Settings Page

**URL**: `http://localhost:3000/settings`

### 14.1 Profile Tab

- [ ] Tab shows current `username` and `email` pre-filled
- [ ] Change username to `UpdatedUser`, click **Save Profile**
- [ ] **Expected**: Success message shown
- [ ] API call: `PUT /api/auth/update`
- [ ] Reload page — username should still be `UpdatedUser`

#### 14.1.1 Password Change

- [ ] Enter current password in **Old Password** field
- [ ] Enter `NewSecurePass456!` in **New Password** field
- [ ] Click **Save Profile**
- [ ] **Expected**: Success
- [ ] Log out, log in with **new** password
- [ ] **Expected**: Login works with new password

#### 14.1.2 Wrong Old Password

- [ ] Enter incorrect old password
- [ ] **Expected**: Error message, password not changed

### 14.2 Avatar Upload

- [ ] Click avatar area to upload an image
- [ ] Select a PNG/JPG file
- [ ] **Expected**: Avatar preview updates immediately (stored in localStorage)

### 14.3 Git Integration Tab

- [ ] Switch to **Git** tab
- [ ] Fill: Repository Name `Jinay-Bhatt/Backend-Api`, Access Token `<PAT>`, Provider `GITHUB`
- [ ] Click **Save Git Config**
- [ ] **Expected**: Success message
- [ ] API call: `POST /api/git-config`
- [ ] Reload page → config pre-loaded (provider + repo name shown, token hidden)

#### 14.3.1 Fetch Git Config

```
GET http://localhost:5000/api/git-config
Authorization: Bearer <token>
```
- [ ] **Expected**: `{ config: { provider, repositoryName, repositoryUrl, isActive } }`
- [ ] Access token is **not** returned (encrypted at rest)

#### 14.3.2 Missing Fields

```
POST http://localhost:5000/api/git-config
Authorization: Bearer <token>
{ "repositoryName": "test" }  ← missing accessToken and provider
```
- [ ] **Expected**: `400 Bad Request`

### 14.4 Export Page

Navigate to the project and select the **Export** tab (pink Package icon) in the secondary navigation bar.

#### 14.4.1 In-Memory Code Preview
- [ ] **Verify Load**: Upon loading the page, a loading skeleton state appears briefly.
- [ ] **File Tree**: A file explorer sidebar list appears on the left showing compiled project assets:
  - `package.json`
  - `tsconfig.json`
  - `prisma.config.ts`
  - `prisma/schema.prisma`
  - `src/index.ts`
  - `src/swagger.ts`
  - `Dockerfile`
  - `docker-compose.yml`
- [ ] **File Loading**: Click on a file in the sidebar list (e.g. `src/index.ts`).
  - [ ] **Expected**: Code content is rendered instantly in the right-side editor panel with monospace typography and line numbers.
- [ ] **Copy Code**: Click the **Copy Code** button in the top right of the code panel.
  - [ ] **Expected**: Button changes color, shows a Check mark, and displays `"Copied!"`. Verify the exact file content is copied to your system clipboard.

#### 14.4.2 Download ZIP Codebase
- [ ] Click the **Download ZIP Codebase** button in the header.
- [ ] **Verify Job Queue**: The status indicator displays `"Queuing compilation task on server..."` followed by `"Compiling source files, configurations, and schemas..."`.
- [ ] **Verify Status Check**: Every 1.5 seconds, the status checks update.
- [ ] **Expected**: The compilation completes, status shows `✓ Codebase successfully compiled!`, and the browser automatically initiates download of the generated `.zip` archive.
- [ ] Open the ZIP archive and verify it contains the full project file tree.

#### 14.4.3 Push to GitHub Repository
- [ ] If no Git provider is configured:
  - [ ] Click the **Link GitHub Repository** button.
  - [ ] **Expected**: Frontend redirects you directly to the workspace settings page configuration panel.
- [ ] If a Git provider is configured:
  - [ ] Click the **Push to <repoName>** button.
  - [ ] **Expected**: The job status updates sequentially indicating compilation, git sync packaging, and successful upload: `✓ Codebase compiled and pushed to Git repo successfully!`.

---

## 15. WebSocket Real-Time Stream

### 15.1 Connection Verification

```javascript
// Open browser DevTools → Console
const socket = io('http://localhost:5000');
socket.on('connect', () => console.log('Connected:', socket.id));
```
- [ ] `connect` event fires immediately
- [ ] No errors in console

### 15.2 Global Connections Count

```javascript
socket.on('global-connections', (count) => console.log('Active sockets:', count));
```
- [ ] **Expected**: Fires immediately with current connection count (e.g. `1`)
- [ ] Open a second tab → counter increments
- [ ] Close the second tab → counter decrements

### 15.3 Global Metrics Stream

```javascript
socket.on('global-metrics', (data) => console.log('Metric:', data));
```
- [ ] Make a gateway call (Section 12)
- [ ] **Expected**: A `global-metrics` event fires with `{ latency, status, route, ... }` within seconds

### 15.4 Landing Page Live Data

- [ ] Navigate to `http://localhost:3000`
- [ ] Open DevTools → Network → WS tab
- [ ] Verify a WebSocket connection is established to `http://localhost:5000`
- [ ] Make a gateway request → observe the bento card bar chart update
- [ ] Active Connections counter should show live count

---

## 16. AI Workflow Generation

**URL**: `http://localhost:3000/projects/[id]/builder`

---

### 16.1 UI Synthesis Action Flow
1. Navigate to the project builder canvas.
2. In the top toolbar, locate and click the **✨ AI SYNTHESIZE** button (which uses a yellow Sparkles icon).
3. **Verify Modal**: The **AI Workflow Synthesizer** modal window should fade into view.
4. **Inspect Button Formatting**:
   - Both the **Cancel** button and the **✨ Synthesize Workflow** button must have a height of `38px` and a border-radius of `8px`.
5. **Add Input**: Inside the prompt textbox, type or copy-paste:
   ```text
   Create a workflow that fetches currency exchange rates from an external public HTTP JSON endpoint and returns the USD rate as the body.
   ```
6. **Submit**: Click the white **✨ Synthesize Workflow** button.
7. **Verify Loading State**:
   - The button should display a loading indicator and change its label to `"Synthesizing..."`.
   - The modal remains visible during prompt execution.
8. **Verify Generation & Canvas Render**:
   - The modal automatically closes on success.
   - A new workflow is created and selected in the active sidebar.
   - **Canvas Verification**:
     - Locate the generated nodes. There should be a `TRIGGER` node, an `httpClientNode` (configured to query an exchange rates API), and a `RESPONSE` node.
     - Verify they are interconnected with blue link arrows in sequence: `TRIGGER` $\rightarrow$ `httpClientNode` $\rightarrow$ `RESPONSE`.
9. **Verify Code Editor Parameters**:
   - Click the generated `httpClientNode`.
   - Verify that its **URL** field contains a valid mock URL (e.g. `https://api.exchangerate-api.com/v4/latest/USD` or similar).
   - Click the `RESPONSE` node.
   - Verify that its **Body** field contains a reference resolving the upstream HTTP request data (e.g., `$steps.node_httpClientNodeId.body`).

---

### 16.2 API Call Verification

```bash
curl -X POST http://localhost:5000/api/ai/generate-workflow \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a workflow that queries users and filters by active status"}'
```
**Expected Response (200 OK)**:
```json
{
  "success": true,
  "workflow": {
    "name": "Query Active Users",
    "path": "/active-users",
    "method": "GET",
    "nodes": [
      { "id": "triggerNode", "type": "triggerNode", "data": { "method": "GET", "path": "/active-users" } },
      { "id": "db_query", "type": "databaseNode", "data": { "query": "SELECT * FROM users WHERE active = true;" } },
      { "id": "response", "type": "responseNode", "data": { "statusCode": 200, "body": "$steps.db_query" } }
    ],
    "edges": [
      { "source": "triggerNode", "target": "db_query" },
      { "source": "db_query", "target": "response" }
    ]
  },
  "message": "Workflow generated successfully by AI"
}
```
- [ ] Response status is 200.
- [ ] Contains a valid JSON object structure with `nodes` and `edges` arrays.

---

### 16.3 Prompt Too Short (Validation Case)
1. Open the AI Synthesize modal.
2. Enter `"test"` (4 characters).
3. Click **✨ Synthesize Workflow**.
4. **Expected**: The frontend shows an error message or fails cleanly, or:
   ```bash
   curl -X POST http://localhost:5000/api/ai/generate-workflow \
     -H "Authorization: Bearer <your-jwt-token>" \
     -H "Content-Type: application/json" \
     -d '{"prompt": "test"}'
   ```
   **Expected Response (400 Bad Request)**:
   ```json
   {
     "error": "Bad Request: prompt must be at least 5 characters"
   }
   ```

---

### 16.4 Prompt Too Long (Validation Case)
1. Send a request with a prompt longer than 1000 characters:
   ```bash
   curl -X POST http://localhost:5000/api/ai/generate-workflow \
     -H "Authorization: Bearer <your-jwt-token>" \
     -H "Content-Type: application/json" \
     -d '{"prompt": "<insert 1001 characters here>"}'
   ```
   **Expected Response (400 Bad Request)**:
   ```json
   {
     "error": "Bad Request: prompt must be under 1000 characters"
   }
   ```

---

### 16.5 Request Without Authorization Header
```bash
curl -X POST http://localhost:5000/api/ai/generate-workflow \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a simple API endpoint workflow"}'
```
- **Expected Response (401 Unauthorized)**

---

### 16.6 AI Provider Heartbeat & Fallback
- [ ] Open `.env` file under backend folder. Set `GROQ_API_KEY=""`.
- [ ] Restart backend.
- [ ] Run the prompt synthesis.
- [ ] **Expected**: Backend log output displays fallback initialization statements, attempting connection to Ollama at `http://127.0.0.1:11434`.
- [ ] If Ollama is offline, verification returns an error payload to the client interface cleanly without server crashes.

---

## 17. Security & Edge Cases

### 17.1 Security Headers

```
GET http://localhost:5000/api/health
```
Inspect response headers:
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `X-XSS-Protection: 1; mode=block`
- [ ] `Referrer-Policy: no-referrer`
- [ ] `Content-Security-Policy` header present

### 17.2 Invalid JWT Token

```
GET http://localhost:5000/api/auth/me
Authorization: Bearer invalid.token.here
```
- [ ] **Expected**: `401 Unauthorized`

### 17.3 Expired JWT Token

- [ ] Manually forge a token with `exp` in the past (or wait for token TTL)
- [ ] **Expected**: `401 Unauthorized` (token rejected)

### 17.4 SQL Injection Attempt in Body

```
POST http://localhost:5000/api/auth/login
{ "email": "'; DROP TABLE users; --", "password": "any" }
```
- [ ] **Expected**: `400` or `401` — NOT a server error
- [ ] Database is NOT corrupted
- [ ] Server does not crash

### 17.5 Extremely Large Request Body

```
POST http://localhost:5000/api/<projectId>/hello
Content-Type: application/json
Body: <10MB JSON payload>
```
- [ ] **Expected**: `413 Payload Too Large` or graceful rejection
- [ ] Server does NOT crash

### 17.6 Cross-User Project Access

- [ ] User A creates project, gets `projectId`
- [ ] User B tries `PUT /api/projects/:projectId` with User B's token
- [ ] **Expected**: `403` or `404` (not authorized)

---

## 18. Rate Limiting

### 18.1 Auth Endpoint Rate Limit

- [ ] Send 6 login requests in rapid succession (within 1 minute)
- [ ] **Expected**: 6th request returns `429 Too Many Requests`
- [ ] Wait the window period → rate limit resets

### 18.2 Gateway Rate Limiting (Workflow Level)

1. In Gateway Config, set Rate Limit: 3 requests per 10 seconds
2. Send 4 rapid gateway requests

```
GET http://localhost:5000/api/<projectId>/<route>
GET http://localhost:5000/api/<projectId>/<route>
GET http://localhost:5000/api/<projectId>/<route>
GET http://localhost:5000/api/<projectId>/<route>  ← 4th
```
- [ ] First 3: `200`
- [ ] 4th: `429 Too Many Requests`

### 18.3 Rate Limit Reset

- [ ] Wait 10+ seconds
- [ ] Send another request
- [ ] **Expected**: `200` (window reset)

---

## 19. Docs Page

**URL**: `http://localhost:3000/docs`

- [ ] Page loads without errors
- [ ] FlowForge logo in tab title / header
- [ ] Navigation sidebar present with section links
- [ ] All documentation sections render properly (no blank content)
- [ ] Code blocks render with syntax highlighting
- [ ] Internal page anchor links work (jump to sections)

---

## 20. Other Static Pages

### 20.1 About Page

**URL**: `http://localhost:3000/about`

- [ ] Page loads without errors
- [ ] FlowForge logo in page header
- [ ] Content renders properly

### 20.2 Changelog Page

**URL**: `http://localhost:3000/changelog`

- [ ] Page loads without errors
- [ ] Version history entries visible

### 20.3 Contact Page

**URL**: `http://localhost:3000/contact`

- [ ] Page loads without errors
- [ ] Contact form or contact details visible

### 20.4 404 Page

**URL**: `http://localhost:3000/this-page-does-not-exist`

- [ ] **Expected**: Custom 404 page (not blank screen)
- [ ] Link to go back to home/dashboard

---

## ✅ Full Test Completion Checklist

Before declaring the platform ready:

- [ ] All backend endpoints return correct HTTP status codes
- [ ] All frontend pages load without console errors
- [ ] Auth token lifecycle (register → login → use → logout) works
- [ ] Gateway correctly routes to the right workflow node chain
- [ ] Socket.IO delivers real-time updates to the monitor and landing page
- [ ] Export compiles and produces a downloadable ZIP
- [ ] AI generates a valid workflow JSON from a prompt
- [ ] Rate limiting blocks excess requests at both auth and gateway levels
- [ ] Cross-user data access is blocked (authorization isolation)
- [ ] Security headers are present on all API responses
- [ ] All modal buttons have proper height and are not too small
- [ ] All footer links resolve to correct destinations

---

## 🐛 Common Issues & Fixes

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| Backend won't start | Missing `.env` variables | Copy `.env.example` and fill values |
| `401` on all API calls | Token missing or wrong format | Re-login, check `ff_token` in localStorage |
| Gateway returns `404` for published workflow | Cache stale | Restart backend (cache is in-memory) |
| Export job stuck in `waiting` | Redis offline + Mock Queue issue | Check backend log for `Mock Queue` confirmation |
| AI returns `500` | No GROQ key + Ollama offline | Set a valid `GROQ_API_KEY` in `.env` |
| Socket.IO not connecting | CORS blocked | Ensure `FRONTEND_URL` in `.env` matches port 3000 |
| `429` immediately on login | Rate limit window still active | Wait 60 seconds and retry |
| Stats on landing page are zeros | Backend offline / DB empty | Run seed: `npx prisma db seed` in `backend/` |
