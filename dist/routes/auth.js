import { registerUser, loginUser } from "../controllers/auth.js";
export async function authRoutes(fastify) {
    fastify.post("/auth/register", registerUser);
    fastify.post("/auth/login", loginUser);
}
