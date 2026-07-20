import "server-only";
import { prisma } from "@/server/db";
import {
  buildDailyContent,
  calculateCheckInStats,
  getStableDailyCard,
  resolveAchievements,
} from "@/lib/daily";

export const dailyRepo = {
  async getOrCreate(ownerId: string, userId: string | null, date: string) {
    const existing = await prisma.dailyReading.findUnique({
      where: { ownerId_date: { ownerId, date } },
    });
    if (existing) return existing;

    const selection = getStableDailyCard(ownerId, date);
    try {
      return await prisma.dailyReading.create({
        data: {
          ownerId,
          userId,
          date,
          ...selection,
          content: JSON.stringify(
            buildDailyContent(selection.cardId, selection.reversed),
          ),
        },
      });
    } catch (error) {
      // A concurrent request may have created today's unique row first.
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "P2002"
      ) {
        const concurrent = await prisma.dailyReading.findUnique({
          where: { ownerId_date: { ownerId, date } },
        });
        if (concurrent) return concurrent;
      }
      throw error;
    }
  },
  async getCheckInDates(ownerIds: string[], year: number, month: number) {
    const start = `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-01`;
    const endMonth = month === 12 ? 1 : month + 1;
    const endYear = month === 12 ? year + 1 : year;
    const end = `${endYear.toString().padStart(4, "0")}-${endMonth.toString().padStart(2, "0")}-01`;
    return (
      await prisma.dailyReading.findMany({
        where: { ownerId: { in: ownerIds }, date: { gte: start, lt: end } },
        select: { date: true },
        orderBy: { date: "asc" },
      })
    ).map(({ date }) => date);
  },
  async getStats(ownerIds: string[], today: string) {
    const rows = await prisma.dailyReading.findMany({
      where: { ownerId: { in: ownerIds } },
      select: { date: true },
      orderBy: { date: "asc" },
    });
    return calculateCheckInStats(
      rows.map(({ date }) => date),
      today,
    );
  },
  async getAchievements(
    userId: string | null,
    stats: ReturnType<typeof calculateCheckInStats>,
  ) {
    const definitions = await prisma.achievement.findMany({
      orderBy: { threshold: "asc" },
    });
    const unlocked = userId
      ? await prisma.userAchievement.findMany({
          where: { userId },
          select: { achievementId: true },
        })
      : [];
    const unlockedIds = new Set(
      unlocked.map(({ achievementId }) => achievementId),
    );
    const resolved = resolveAchievements(definitions, stats);
    if (userId) {
      const newlyUnlocked = resolved.filter(
        (achievement) =>
          achievement.unlocked && !unlockedIds.has(achievement.id),
      );
      if (newlyUnlocked.length) {
        await prisma.$transaction(
          newlyUnlocked.map((achievement) =>
            prisma.userAchievement.upsert({
              where: {
                userId_achievementId: {
                  userId,
                  achievementId: achievement.id,
                },
              },
              update: {},
              create: { userId, achievementId: achievement.id },
            }),
          ),
        );
        newlyUnlocked.forEach((achievement) => unlockedIds.add(achievement.id));
      }
    }
    return resolved.map((achievement) => ({
      ...achievement,
      unlocked: unlockedIds.has(achievement.id) || achievement.unlocked,
    }));
  },
};
