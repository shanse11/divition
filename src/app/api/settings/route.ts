import { NextResponse } from "next/server";
import { settingsSchema } from "@/lib/validation/auth";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";

const select = {
  defaultStyle: true,
  motionLevel: true,
  musicEnabled: true,
  musicVolume: true,
  shareShowQuestion: true,
} as const;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const settings = await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
    select,
  });
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "参数校验失败" },
      { status: 400 },
    );
  const settings = await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: parsed.data,
    create: { userId: user.id, ...parsed.data },
    select,
  });
  return NextResponse.json({ settings });
}
