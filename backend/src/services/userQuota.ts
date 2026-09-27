import { prisma } from "./db.js";

export interface QuotaUser {
  id: string;
  plan?: string | null;
  aiGenerationsCount?: number | null;
  aiGenerationsResetAt?: Date | string | null;
  createdAt?: Date | string | null;
}

/**
 * Checks and updates the 30-day AI generation quota cycle for a user.
 * - If 30 days (30 * 24h) have elapsed since aiGenerationsResetAt, reset count to 0 and start a new 30-day cycle.
 * - Otherwise, keep the exact current aiGenerationsCount unchanged regardless of login / sign-in activity.
 */
export async function checkAndResetAiQuota<T extends QuotaUser>(user: T): Promise<T> {
  const now = new Date();
  const resetAt = user.aiGenerationsResetAt
    ? new Date(user.aiGenerationsResetAt)
    : user.createdAt
    ? new Date(user.createdAt)
    : now;

  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  if (now.getTime() - resetAt.getTime() > thirtyDaysMs) {
    // 30 days have elapsed: reset counter to 0 and set new 30-day cycle start date
    await prisma.user.update({
      where: { id: user.id },
      data: {
        aiGenerationsCount: 0,
        aiGenerationsResetAt: now,
      },
    });

    return {
      ...user,
      aiGenerationsCount: 0,
      aiGenerationsResetAt: now,
    };
  }

  // Ensure aiGenerationsResetAt is populated in database if previously null
  if (!user.aiGenerationsResetAt) {
    await prisma.user.update({
      where: { id: user.id },
      data: { aiGenerationsResetAt: resetAt },
    });
    return {
      ...user,
      aiGenerationsResetAt: resetAt,
    };
  }

  return user;
}
