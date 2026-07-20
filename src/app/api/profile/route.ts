import { NextResponse } from "next/server";
import { profileSchema } from "@/lib/validation/auth";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  return NextResponse.json({ profile: user });
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
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "参数校验失败" },
      { status: 400 },
    );
  const data = parsed.data;
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...data,
      birthDate:
        data.birthDate === undefined
          ? undefined
          : data.birthDate
            ? new Date(`${data.birthDate}T00:00:00.000Z`)
            : null,
    },
    select: {
      id: true,
      email: true,
      nickname: true,
      avatarSeed: true,
      bio: true,
      birthDate: true,
    },
  });
  return NextResponse.json({
    profile: {
      ...updated,
      birthDate: updated.birthDate?.toISOString().slice(0, 10) ?? null,
    },
  });
}
