import { Server } from "socket.io";
import { FastifyInstance } from "fastify";

/**
 * Initializes the Socket.IO server and binds it to the Fastify HTTP server instance.
 * Decorates the Fastify instance with the Socket.IO server manager.
 */
export function initWebsocket(fastify: FastifyInstance): Server {
  const io = new Server(fastify.server, {
    cors: {
      origin: "*", // Allow all origins for visual client testing
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    fastify.log.info(`🔌 Client connected to WebSocket: ${socket.id}`);

    // Join a room associated with the project for scoped metrics broadcasts
    socket.on("join-project", (projectId: string) => {
      if (!projectId) return;
      socket.join(projectId);
      fastify.log.info(
        `👤 Client ${socket.id} joined project room: ${projectId}`
      );
    });

    socket.on("disconnect", () => {
      fastify.log.info(`🔌 Client disconnected from WebSocket: ${socket.id}`);
    });
  });

  // Decorate the fastify instance with the io instance
  fastify.decorate("io", io);

  return io;
}

// Augment FastifyInstance type to support typescript type-checks for decorators
declare module "fastify" {
  interface FastifyInstance {
    io: Server;
  }
}
