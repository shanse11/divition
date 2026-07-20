import { NextResponse, type NextRequest } from "next/server";
import { loginSchema } from "@/lib/validation/auth";
import { prisma } from "@/server/db";
import { createSession, verifyPassword } from "@/server/auth";
import { checkRateLimit } from "@/server/rate-limit";
import { getAnonId } from "@/server/identity";
import { readingsRepo } from "@/server/repo/readings";
import { dreamsRepo } from "@/server/repo/dreams";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!checkRateLimit(`login:${ip}`, 10, 10 * 60_000).ok) {
    return NextResponse.json(
      { error: "尝试次数过多,请稍后再试" },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "参数校验失败" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  // 统一错误信息,避免暴露邮箱是否存在
  if (
    !user ||
    !(await verifyPassword(parsed.data.password, user.passwordHash))
  ) {
    return NextResponse.json({ error: "邮箱或密码不正确" }, { status: 401 });
  }

  const anonId = await getAnonId();
  if (anonId) {
    await readingsRepo.claimByUser(anonId, user.id);
    await prisma.dailyReading.updateMany({
      where: { ownerId: anonId },
      data: { ownerId: user.id, userId: user.id },
    });
    await dreamsRepo.claimByUser(anonId, user.id);
  }
  await createSession(user.id);
  logger.info("auth.logged_in", { userId: user.id });
  return NextResponse.json({ ok: true });
}
