import { NextResponse, type NextRequest } from "next/server";
import { dreamUpdateSchema } from "@/lib/validation/dream";
import { getCurrentUser } from "@/server/auth";
import { getAnonId } from "@/server/identity";
import { dreamsRepo } from "@/server/repo/dreams";

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function authorize(id: string) {
  const dream = await dreamsRepo.findById(id);
  if (!dream) return null;
  const user = await getCurrentUser();
  const anonId = await getAnonId();
  return (user && dream.ownerId === user.id) ||
    (anonId && dream.ownerId === anonId)
    ? dream
    : null;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const dream = await authorize(id);
  if (!dream) {
    return NextResponse.json({ error: "记录不存在或无权限" }, { status: 404 });
  }
  return NextResponse.json({ dream });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const dream = await authorize(id);
  if (!dream) {
    return NextResponse.json({ error: "记录不存在或无权限" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }
  const parsed = dreamUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "参数校验失败" },
      { status: 400 },
    );
  }

  const updated = await dreamsRepo.update(id, parsed.data);
  return NextResponse.json({ dream: updated });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const dream = await authorize(id);
  if (!dream) {
    return NextResponse.json({ error: "记录不存在或无权限" }, { status: 404 });
  }
  await dreamsRepo.delete(id);
  return NextResponse.json({ ok: true });
}
