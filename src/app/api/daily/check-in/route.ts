import { format } from "date-fns";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { ensureAnonId } from "@/server/identity";
import { checkRateLimit } from "@/server/rate-limit";
import { dailyRepo } from "@/server/repo/daily";

export async function POST() {
  const user = await getCurrentUser();
  const ownerId = user?.id ?? (await ensureAnonId());
  const limited = checkRateLimit(`daily-check-in:${ownerId}`, 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "请求过于频繁" }, { status: 429 });
  }
  const date = format(new Date(), "yyyy-MM-dd");
  const daily = await dailyRepo.getOrCreate(ownerId, user?.id ?? null, date);
  return NextResponse.json({ date, dailyId: daily.id, checkedIn: true });
}
