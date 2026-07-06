import { FastifyInstance } from "fastify";
import { registerUser, loginUser } from "../controllers/auth.js";

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/auth/register", registerUser);
  fastify.post("/auth/login", loginUser);
}
