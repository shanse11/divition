import { NextResponse } from "next/server";
import { format } from "date-fns";
import { getCurrentUser } from "@/server/auth";
import { ensureAnonId } from "@/server/identity";
import { dailyRepo } from "@/server/repo/daily";

export async function GET() {
  const user = await getCurrentUser();
  const ownerId = user?.id ?? (await ensureAnonId());
  const daily = await dailyRepo.getOrCreate(
    ownerId,
    user?.id ?? null,
    format(new Date(), "yyyy-MM-dd"),
  );
  const today = format(new Date(), "yyyy-MM-dd");
  const stats = await dailyRepo.getStats([ownerId], today);
  const achievements = await dailyRepo.getAchievements(user?.id ?? null, stats);
  const current = new Date();
  const dates = await dailyRepo.getCheckInDates(
    [ownerId],
    current.getFullYear(),
    current.getMonth() + 1,
  );
  return NextResponse.json({
    ...daily,
    content: JSON.parse(daily.content),
    stats,
    achievements,
    checkInDates: dates,
  });
}
