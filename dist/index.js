import Fastify from 'fastify';
import cors from '@fastify/cors';
import { runHealthRoutes } from './routes/health.js';
const fastify = Fastify({ logger: true });
// Register CORS to allow requests from the Next.js frontend
await fastify.register(cors, {
    origin: true, // Allow all origins for the template
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});
// Register health routes
await fastify.register(runHealthRoutes, { prefix: '/api' });
const start = async () => {
    try {
        const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
        await fastify.listen({ port, host: '0.0.0.0' });
        console.log(`🚀 Template server ready at http://localhost:${port}`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
