import { NextResponse, type NextRequest } from "next/server";
import { accountDeleteSchema } from "@/lib/validation/auth";
import { clearSessionCookie, getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { checkRateLimit } from "@/server/rate-limit";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!checkRateLimit(`account-delete:${user.id}:${ip}`, 3, 60 * 60_000).ok)
    return NextResponse.json(
      { error: "尝试次数过多,请稍后再试" },
      { status: 429 },
    );
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }
  const parsed = accountDeleteSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "请输入“删除我的账号”以确认" },
      { status: 400 },
    );

  await prisma.$transaction(async (tx) => {
    // ownerId 没有外键；显式清除可能由旧版/迁移流程留下的用户归属数据。
    const ownedReadings = await tx.tarotReading.findMany({
      where: { OR: [{ userId: user.id }, { ownerId: user.id }] },
      select: { id: true },
    });
    const readingIds = ownedReadings.map(({ id }) => id);
    if (readingIds.length) {
      await tx.shareLink.deleteMany({
        where: { readingId: { in: readingIds } },
      });
      await tx.readingNote.deleteMany({
        where: { readingId: { in: readingIds } },
      });
      await tx.tarotDraw.deleteMany({
        where: { readingId: { in: readingIds } },
      });
      await tx.favorite.deleteMany({
        where: {
          OR: [
            { readingId: { in: readingIds } },
            { ownerId: user.id },
            { userId: user.id },
          ],
        },
      });
      await tx.tarotReading.deleteMany({ where: { id: { in: readingIds } } });
    } else {
      await tx.favorite.deleteMany({
        where: { OR: [{ ownerId: user.id }, { userId: user.id }] },
      });
    }
    await tx.dailyReading.deleteMany({
      where: { OR: [{ ownerId: user.id }, { userId: user.id }] },
    });
    await tx.dreamReading.deleteMany({
      where: { OR: [{ ownerId: user.id }, { userId: user.id }] },
    });
    await tx.userAchievement.deleteMany({ where: { userId: user.id } });
    await tx.userSettings.deleteMany({ where: { userId: user.id } });
    await tx.account.deleteMany({ where: { userId: user.id } });
    await tx.session.deleteMany({ where: { userId: user.id } });
    await tx.user.delete({ where: { id: user.id } });
  });
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
