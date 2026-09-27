import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { authenticate } from "../middlewares/auth.js";
import { rateLimitAI } from "../middlewares/rateLimit.js";
import { generateWorkflowFromPrompt } from "../services/ai.js";
import { prisma } from "../services/db.js";
import { createNotification } from "../services/notifications.js";
import { checkAndResetAiQuota } from "../services/userQuota.js";

export async function aiRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  fastify.post(
    "/ai/generate-workflow",
    { preHandler: [rateLimitAI] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { prompt } = request.body as { prompt?: string };
      const userId = (request.user as any).id;

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
        const rawUser = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            plan: true,
            aiGenerationsCount: true,
            aiGenerationsResetAt: true,
            createdAt: true,
          },
        });

        if (!rawUser) {
          return reply.status(404).send({ error: "User not found" });
        }

        // Check 30-day AI quota cycle
        const user = await checkAndResetAiQuota(rawUser);

        const now = new Date();
        const currentCount = user.aiGenerationsCount || 0;
        const resetAt = user.aiGenerationsResetAt ? new Date(user.aiGenerationsResetAt) : now;
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

        // Quota: Free = 3/month, Pro = 12/month
        const isPro = user.plan === "PRO_MONTHLY" || user.plan === "PRO_YEARLY";
        const monthlyLimit = isPro ? 12 : 3;

        if (currentCount >= monthlyLimit) {
          const daysRemaining = Math.max(1, Math.ceil((resetAt.getTime() + thirtyDaysMs - now.getTime()) / (24 * 60 * 60 * 1000)));
          return reply.status(403).send({
            error: "AI Generation Quota Exceeded",
            message: isPro
              ? `You have reached your monthly quota of ${monthlyLimit} AI generations. Your quota will reset in ${daysRemaining} days.`
              : `You have reached your Free plan limit of ${monthlyLimit} AI generations this month. Upgrade to Pro for 12 generations/month, or wait ${daysRemaining} days for reset.`,
            code: "AI_QUOTA_EXCEEDED",
            used: currentCount,
            limit: monthlyLimit,
            plan: user.plan || "FREE",
            daysRemaining,
          });
        }

        const workflow = await generateWorkflowFromPrompt(prompt.trim());

        // Increment count in database
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { aiGenerationsCount: { increment: 1 } },
          select: { aiGenerationsCount: true },
        });

        // Real-time notification
        createNotification({
          userId,
          title: "AI Generation Complete",
          message: `Generated workflow from prompt: "${prompt.slice(0, 36)}${prompt.length > 36 ? '...' : ''}"`,
          type: "success",
        }).catch(() => {});

        return reply.send({
          success: true,
          workflow,
          message: "Workflow generated successfully by AI",
          quota: {
            used: updatedUser.aiGenerationsCount,
            limit: monthlyLimit,
            remaining: Math.max(0, monthlyLimit - updatedUser.aiGenerationsCount),
          },
        });
      } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({
          error: "AI generation failed",
          details: error.message,
        });
      }
    }
  );
}
