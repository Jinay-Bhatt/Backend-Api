import fs from "node:fs";
import path from "node:path";
import { exportQueue } from "../queue/exportQueue.js";
import { authenticate } from "../middlewares/auth.js";
import { prisma } from "../services/db.js";
export async function exportRoutes(fastify) {
    // All compilation exporter endpoints require authentication
    fastify.addHook("preHandler", authenticate);
    // Submit project compilation job
    fastify.post("/projects/:projectId/export", async (request, reply) => {
        const { projectId } = request.params;
        const { pushToGit } = request.body;
        const user = request.user;
        try {
            const project = await prisma.project.findFirst({
                where: { id: projectId, ownerId: user.id },
            });
            if (!project) {
                return reply.status(404).send({
                    error: "Not Found: Project not found or unauthorized",
                });
            }
            // Push compilation task job to BullMQ
            const job = await exportQueue.add("compile-task", {
                projectId,
                userId: user.id,
                pushToGit: !!pushToGit,
            });
            return reply.status(202).send({
                jobId: job.id,
                message: "Compilation exporter task queued successfully",
            });
        }
        catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                error: "Internal Server Error",
                details: error.message,
            });
        }
    });
    // Query compilation job state status
    fastify.get("/projects/:projectId/export/status/:jobId", async (request, reply) => {
        const { projectId, jobId } = request.params;
        const user = request.user;
        try {
            const project = await prisma.project.findFirst({
                where: { id: projectId, ownerId: user.id },
            });
            if (!project) {
                return reply.status(404).send({
                    error: "Not Found: Project not found or unauthorized",
                });
            }
            const job = await exportQueue.getJob(jobId);
            if (!job) {
                return reply.status(404).send({
                    error: "Not Found: Exporter job not found",
                });
            }
            const state = await job.getState();
            const progress = job.progress;
            const failedReason = job.failedReason;
            const returnValue = job.returnvalue; // BullMQ return value
            return reply.send({
                id: job.id,
                state,
                progress,
                failedReason,
                returnValue,
            });
        }
        catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                error: "Internal Server Error",
                details: error.message,
            });
        }
    });
    // Download the compiled ZIP package
    fastify.get("/projects/:projectId/export/download", async (request, reply) => {
        const { projectId } = request.params;
        const user = request.user;
        try {
            const project = await prisma.project.findFirst({
                where: { id: projectId, ownerId: user.id },
            });
            if (!project) {
                return reply.status(404).send({
                    error: "Not Found: Project not found or unauthorized",
                });
            }
            const zipPath = path.resolve("exports", `${projectId}.zip`);
            if (!fs.existsSync(zipPath)) {
                return reply.status(404).send({
                    error: "Not Found: ZIP codebase package has not been compiled yet",
                });
            }
            const zipStream = fs.createReadStream(zipPath);
            return reply
                .type("application/zip")
                .header("Content-Disposition", `attachment; filename="${project.name.toLowerCase().replace(/[^a-z0-9]/g, "")}-backend.zip"`)
                .send(zipStream);
        }
        catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                error: "Internal Server Error",
                details: error.message,
            });
        }
    });
}
