import { NextResponse, type NextRequest } from "next/server";
import { noteReadingSchema } from "@/lib/validation/reading-management";
import { getCurrentUser } from "@/server/auth";
import { getAnonId } from "@/server/identity";
import { readingsRepo } from "@/server/repo/readings";

interface RouteContext {
  params: Promise<{ id: string }>;
}
export async function POST(request: NextRequest, context: RouteContext) {
  const parsed = noteReadingSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json({ error: "参数校验失败" }, { status: 400 });
  const [user, anonId] = await Promise.all([getCurrentUser(), getAnonId()]);
  const owners = user
    ? [user.id, ...(anonId ? [anonId] : [])]
    : anonId
      ? [anonId]
      : [];
  try {
    await readingsRepo.update((await context.params).id, parsed.data, owners);
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
