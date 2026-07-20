import { NextResponse, type NextRequest } from "next/server";
import { updateReadingSchema } from "@/lib/validation/reading";
import { readingsRepo } from "@/server/repo/readings";
import { getAnonId } from "@/server/identity";
import { getCurrentUser } from "@/server/auth";

async function ownerIds() {
  const [user, anonId] = await Promise.all([getCurrentUser(), getAnonId()]);
  return user ? [user.id, ...(anonId ? [anonId] : [])] : anonId ? [anonId] : [];
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }
  const parsed = updateReadingSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "参数校验失败" }, { status: 400 });
  try {
    await readingsRepo.update(id, parsed.data, await ownerIds());
  } catch (error) {
    if (error instanceof Error && error.message === "READING_NOT_FOUND")
      return NextResponse.json(
        { error: "记录不存在或无权限" },
        { status: 404 },
      );
    throw error;
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    await readingsRepo.delete(id, await ownerIds());
  } catch (error) {
    if (error instanceof Error && error.message === "READING_NOT_FOUND")
      return NextResponse.json(
        { error: "记录不存在或无权限" },
        { status: 404 },
      );
    throw error;
  }
  return NextResponse.json({ ok: true });
}
