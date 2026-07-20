import { NextResponse, type NextRequest } from "next/server";
import { registerSchema } from "@/lib/validation/auth";
import { prisma } from "@/server/db";
import { createSession, hashPassword } from "@/server/auth";
import { getAnonId } from "@/server/identity";
import { readingsRepo } from "@/server/repo/readings";
import { dreamsRepo } from "@/server/repo/dreams";
import { checkRateLimit } from "@/server/rate-limit";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!checkRateLimit(`register:${ip}`, 5, 10 * 60_000).ok) {
    return NextResponse.json(
      { error: "操作太频繁,请稍后再试" },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "参数校验失败" },
      { status: 400 },
    );
  }

  const { email, password, nickname } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "该邮箱已注册" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
      nickname,
      settings: { create: {} },
    },
  });

  // 将匿名期间的占卜记录归入账号
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
  logger.info("auth.registered", { userId: user.id });
  return NextResponse.json({ ok: true });
}
