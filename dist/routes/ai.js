import { authenticate } from "../middlewares/auth.js";
import { generateWorkflowFromPrompt } from "../services/ai.js";
export async function aiRoutes(fastify) {
    fastify.addHook("preHandler", authenticate);
    fastify.post("/ai/generate-workflow", async (request, reply) => {
        const { prompt } = request.body;
        if (!prompt || prompt.trim().length < 5) {
            return reply.status(400).send({
                error: "Bad Request: prompt must be at least 5 characters",
            });
        }
        if (prompt.length > 1000) {
            return reply.status(400).send({
                error: "Bad Request: prompt must be under 1000 characters",
            });
        }
        try {
            const workflow = await generateWorkflowFromPrompt(prompt.trim());
            return reply.send({
                success: true,
                workflow,
                message: "Workflow generated successfully by AI",
            });
        }
        catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                error: "AI generation failed",
                details: error.message,
            });
        }
    });
}
