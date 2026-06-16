import bcrypt from "bcryptjs";
import { prisma } from "../services/db.js";
export async function registerUser(request, reply) {
    const { username, email, password } = request.body;
    if (!username || !email || !password) {
        return reply.status(400).send({
            error: "Bad Request: username, email, and password are required",
        });
    }
    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return reply.status(400).send({
                error: "Conflict: Email address already registered",
            });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash,
            },
        });
        return reply.status(201).send({
            message: "User registered successfully",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        request.log.error(error);
        return reply.status(500).send({
            error: "Internal Server Error",
            details: error.message,
        });
    }
}
export async function loginUser(request, reply) {
    const { email, password } = request.body;
    if (!email || !password) {
        return reply.status(400).send({
            error: "Bad Request: email and password are required",
        });
    }
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return reply.status(401).send({
                error: "Unauthorized: Invalid email or password",
            });
        }
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) {
            return reply.status(401).send({
                error: "Unauthorized: Invalid email or password",
            });
        }
        // Sign a JWT token containing user identity details
        const token = await reply.jwtSign({
            id: user.id,
            email: user.email,
        });
        return reply.send({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        });
    }
    catch (error) {
        request.log.error(error);
        return reply.status(500).send({
            error: "Internal Server Error",
            details: error.message,
        });
    }
}
