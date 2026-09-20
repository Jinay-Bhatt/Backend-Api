import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";

const { Pool } = pg;

// High-Throughput Connection Pool (Tuned for Neon Serverless PostgreSQL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                       // Up to 20 active pool sockets per instance
  idleTimeoutMillis: 10000,      // Recycle idle connections every 10s before Neon serverless drops them
  connectionTimeoutMillis: 10000,// Allow 10s for initial SSL handshake
  keepAlive: true,
});

// Handle Neon serverless idle socket drops gracefully without server interruption
pool.on("error", (err: any) => {
  if (err.message && err.message.includes("connection timeout")) {
    // Normal serverless pool recycling notice — silent handle
    return;
  }
  console.warn("⚠️ Postgres connection pool notice:", err.message || err);
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  log: ["error"],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
