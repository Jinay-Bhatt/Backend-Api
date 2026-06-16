import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { runHealthRoutes } from './routes/health.js';
import { config } from './config/index.js';
import { prisma } from './services/db.js';
import { authRoutes } from './routes/auth.js';
import { projectRoutes } from './routes/projects.js';
import { workflowRoutes } from './routes/workflows.js';
import { exportRoutes } from './routes/exporter.js';
import { gatewayRoutes } from './routes/gateway.js';
import { startWorker } from './queue/worker.js';
import { initWebsocket } from './websocket.js';

const fastify = Fastify({ logger: true });

// Initialize Socket.IO WebSocket server
initWebsocket(fastify);

// Register CORS to allow requests from the Next.js frontend
await fastify.register(cors, {
  origin: true, // Allow all origins for the template
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

// Register JWT authentication plugin
await fastify.register(jwt, {
  secret: config.jwtSecret,
});

// Register routes
await fastify.register(runHealthRoutes, { prefix: '/api' });
await fastify.register(authRoutes, { prefix: '/api' });
await fastify.register(projectRoutes, { prefix: '/api' });
await fastify.register(workflowRoutes, { prefix: '/api' });
await fastify.register(exportRoutes, { prefix: '/api' });
await fastify.register(gatewayRoutes);

const start = async () => {
  try {
    // Validate database connection
    await prisma.$connect();
    console.log('✅ Database connection established successfully');

    // Initialize BullMQ worker for background compilations
    startWorker();
    console.log('📦 BullMQ background compilation worker started');

    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`🚀 Template server ready at http://localhost:${config.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
