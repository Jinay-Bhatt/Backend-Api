import { FastifyInstance } from 'fastify';

export async function runHealthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'FlowForge Backend Template is connected and running!',
    };
  });
}
