import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";

const { Pool } = pg;

// High-Throughput Connection Pool (Tuned for 100,000+ Concurrent Requests)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 30,                       // Up to 30 active pool sockets per instance
  idleTimeoutMillis: 15000,      // Recycle idle connections every 15s to keep pool fresh
  connectionTimeoutMillis: 5000, // Drop queued requests if pool doesn't grant socket in 5s
  statement_timeout: 10000,      // Cancel any query taking longer than 10s to prevent locks
  keepAlive: true,
});

// Handle pool notices gracefully
pool.on("error", (err) => {
  console.warn("⚠️ Postgres connection pool notice:", err.message);
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
