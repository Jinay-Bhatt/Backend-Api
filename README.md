# FlowForge Backend API & Gateway

FlowForge is a visual backend API and workflow builder. Developers and end-users can design backend routing pipelines (DAGs) visually, secure them with JWT/API keys, run them inside a secure VM sandbox, and monitor executions in real-time.

---

## 📂 Project Structure
- **`backend/`**: Fastify API gateway server, database connector (Prisma), background job compiler (BullMQ), and services.
- **`frontend/`**: Next.js user interface for visual drag-and-drop workflow editing.
- **`Docs/`**: Architectural guides, design specs, and reference materials.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **PostgreSQL** database (configured via `DATABASE_URL` in `backend/.env`)
- **Redis** server (configured via `REDIS_URL` in `backend/.env` for background worker compilation tasks)

### 2. Installation
Install dependencies in both the backend and frontend folders:
```bash
# Using root helper script to install both:
npm run install-all

# Or install manually in each folder:
cd backend && npm install
cd ../frontend && npm install
```

### 3. Database Migration & Seeding
Set up database schemas, run migrations, and initialize test data:
```bash
cd backend

# 1. Generate Prisma clients and execute migrations
npx prisma db push

# 2. Run the database seed script to initialize projects and workflows
npx tsx prisma/seed.ts
```

### 4. Running the Development Servers
Start both servers in development watch-mode:
```bash
# Start backend (runs on http://localhost:5000)
npm run dev:backend

# Start frontend (runs on http://localhost:3000)
npm run dev:frontend
```

---

## 📡 Testing Dynamic Gateway APIs

All dynamic routes built by drag-and-drop or generated via AI are served under the wildcard API gateway:
$$\text{http://localhost:5000/api/}\{\text{projectId}\}\{\text{your-custom-path}\}$$

### How to Test Routes:
1. **Interactive REST Client (Recommended):**
   Use the preconfigured [api-tests.http](./backend/api-tests.http) file in VS Code (requires the **REST Client** extension). It allows you to trigger requests to health checks, register/login, and fetch protected data directly from your editor.
2. **Browser (for `GET` routes):**
   Paste the gateway URL directly into your browser tab:
   `http://localhost:5000/api/c359218a-13dc-4279-a8ac-c73d2a1bacb4/products`
3. **Live Monitor Tab (`/projects/[id]/monitor`):**
   Keep this tab open while sending requests. It listens to WebSocket events from the backend and prints real-time logs of Method, Route, Latency, and HTTP Status Codes.
4. **Analytics Tab (`/projects/[id]/analytics`):**
   Inspect aggregate metrics like error rates, throughput, and average latencies.

---

## ⚙️ Data Transformation (Mapping) Node Guidelines

When using **Data Transformation** nodes in the visual canvas:
* The previous node outputs are cached under `context.steps.<node_id>`.
* To format a list of products returned from a database query (`node_2`) to return only `id`, `name`, and `price`, enter the following mapping expression:
  ```javascript
  context.steps.node_2.map(product => ({ id: product.id, name: product.name, price: product.price }))
  ```
* In the downstream **Response Node**, set the response body to **`$steps.<your_transform_node_id>`** (e.g., `$steps.node_3`) to output the JSON payload.
