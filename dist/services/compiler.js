import { orderNodes } from "./dag.js";
/**
 * Compiles a visual project and its workflows into a standalone Fastify + TypeScript + Prisma codebase.
 * Returns a Record mapping absolute project file paths to their string contents.
 */
export function compileProject(projectName, workflows) {
    const fileTree = {};
    // 1. package.json
    fileTree["package.json"] = JSON.stringify({
        name: projectName.toLowerCase().replace(/[^a-z0-9-_]/g, ""),
        version: "1.0.0",
        type: "module",
        main: "dist/index.js",
        scripts: {
            build: "tsc",
            start: "node dist/index.js",
            dev: "tsx watch src/index.ts",
        },
        dependencies: {
            fastify: "^5.8.5",
            "@fastify/cors": "^11.2.0",
            "@fastify/jwt": "^10.1.0",
            "@prisma/client": "^7.8.0",
            "@prisma/adapter-pg": "^7.8.0",
            pg: "^8.13.1",
            dotenv: "^17.4.2",
        },
        devDependencies: {
            typescript: "^6.0.3",
            "@types/node": "^25.9.3",
            "@types/pg": "^8.11.10",
            tsx: "^4.22.4",
            prisma: "^7.8.0",
        },
    }, null, 2);
    // 2. tsconfig.json
    fileTree["tsconfig.json"] = JSON.stringify({
        compilerOptions: {
            target: "ES2022",
            module: "NodeNext",
            moduleResolution: "NodeNext",
            esModuleInterop: true,
            strict: true,
            skipLibCheck: true,
            outDir: "./dist",
        },
        include: ["src/**/*"],
    }, null, 2);
    // 3. prisma.config.ts (Prisma 7 style)
    fileTree["prisma.config.ts"] = `import { defineConfig, env } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
`;
    // 4. prisma/schema.prisma
    fileTree["prisma/schema.prisma"] = `datasource db {
  provider = "postgresql"
}

generator client {
  provider = "prisma-client-js"
}

// Default placeholder product table to support database CRUD nodes testing
model Product {
  id          String   @id @default(uuid())
  name        String
  price       Float
  category    String
  createdAt   DateTime @default(now())
}
`;
    // 5. .env.example
    fileTree[".env.example"] = `PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/flowforge_exported?sslmode=require"
JWT_SECRET="exported-application-super-secret-jwt-key"
`;
    // 6. Dockerfile (multi-stage lightweight deploy build)
    fileTree["Dockerfile"] = `# Build Stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci
COPY src ./src
RUN npx prisma generate
RUN npm run build

# Production Stage
FROM node:22-alpine
WORKDIR /app
COPY package*.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 5000
CMD ["npm", "start"]
`;
    // 7. docker-compose.yml (Local application stack runner)
    fileTree["docker-compose.yml"] = `version: "3.8"
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - DATABASE_URL=postgresql://postgres:password@db:5432/flowforge_exported?sslmode=require
      - JWT_SECRET=compose-jwt-secret-key-1234
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=flowforge_exported
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
`;
    // 8. src/services/db.ts (Prisma 7 connector singleton)
    fileTree["src/services/db.ts"] = `import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
`;
    // 9. src/index.ts (Bootstrapper entrypoint)
    fileTree["src/index.ts"] = `import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import dotenv from "dotenv";
import { registerRoutes } from "./routes/api.js";
import { prisma } from "./services/db.js";

dotenv.config();

const fastify = Fastify({ logger: true });

// Register CORS
await fastify.register(cors, { origin: true });

// Register JWT Verification
await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || "fallback-jwt-signing-secret-key-999",
});

// Register API Routes
await fastify.register(registerRoutes, { prefix: "/api" });

const start = async () => {
  try {
    await prisma.$connect();
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
    await fastify.listen({ port, host: "0.0.0.0" });
    console.log("🚀 Standalone API Gateway active on port " + port);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
`;
    // 10. src/routes/api.ts (Compiled Visual Workflows)
    let apiFileContent = `import { FastifyInstance } from "fastify";
import { prisma } from "../services/db.js";

// Helper to safely extract nested context properties
function resolveVariable(path: string, context: any): any {
  if (!path) return undefined;
  const parts = path.split(".");
  let current = context;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

// Helper to parameterize queries for prepared statement SQL execution
function parameterizeSqlQuery(query: string, context: any): { sql: string; values: any[] } {
  const variableRegex = /\\$([a-zA-Z0-9_\\.]+)/g;
  const values: any[] = [];
  let index = 1;
  const sql = query.replace(variableRegex, (match, path) => {
    const val = resolveVariable(path, context);
    values.push(val !== undefined ? val : null);
    return "$" + (index++);
  });
  return { sql, values };
}

export async function registerRoutes(fastify: FastifyInstance) {
`;
    for (const workflow of workflows) {
        const nodes = workflow.nodes || [];
        const edges = workflow.edges || [];
        let orderedNodes = [];
        try {
            orderedNodes = orderNodes(nodes, edges);
        }
        catch (err) {
            // Fallback in case DAG has circular dependencies
            orderedNodes = nodes;
        }
        const routeMethod = workflow.method.toLowerCase();
        const routePath = workflow.path;
        apiFileContent += `
  // Route: ${workflow.method} ${workflow.path}
  fastify.${routeMethod}("${routePath}", async (request, reply) => {
    const context = {
      request: {
        body: request.body,
        query: request.query,
        params: request.params,
        headers: request.headers,
      },
      steps: {} as Record<string, any>,
    };

    try {`;
        for (const node of orderedNodes) {
            if (node.type === "triggerNode" ||
                node.type === "httpTrigger" ||
                node.type === "trigger") {
                continue;
            }
            if (node.type === "databaseNode" || node.type === "database") {
                const rawSql = node.data?.query || "";
                const escapedSql = rawSql.replace(/`/g, "\\`").replace(/\$/g, "\\$");
                apiFileContent += `
      // Database query node: ${node.id}
      const query_${node.id} = \`${escapedSql}\`;
      const { sql: sql_${node.id}, values: values_${node.id} } = parameterizeSqlQuery(query_${node.id}, context);
      const db_${node.id} = await prisma.$queryRawUnsafe(sql_${node.id}, ...values_${node.id});
      context.steps["${node.id}"] = db_${node.id};
`;
            }
            if (node.type === "customCodeNode" || node.type === "code") {
                const codeScript = node.data?.code || "";
                apiFileContent += `
      // Custom JS node: ${node.id}
      context.steps["${node.id}"] = (function(context) {
        ${codeScript}
      })(context);
`;
            }
            if (node.type === "responseNode" || node.type === "response") {
                const status = node.data?.statusCode || 200;
                const bodyValue = node.data?.body;
                if (typeof bodyValue === "string" && bodyValue.startsWith("$")) {
                    apiFileContent += `
      // Response node: ${node.id}
      const response_${node.id} = resolveVariable("${bodyValue.slice(1)}", context);
      return reply.status(${status}).send(response_${node.id});
`;
                }
                else {
                    apiFileContent += `
      // Response node: ${node.id}
      return reply.status(${status}).send(${JSON.stringify(bodyValue)});
`;
                }
            }
        }
        apiFileContent += `
      // Default fallback return
      return reply.status(200).send({ message: "Workflow executed successfully" });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({
        error: "Internal Server Error",
        message: err.message,
      });
    }
  });
`;
    }
    apiFileContent += `}\n`;
    fileTree["src/routes/api.ts"] = apiFileContent;
    return fileTree;
}
