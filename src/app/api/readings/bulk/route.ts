import { NextResponse, type NextRequest } from "next/server";
import { bulkReadingsSchema } from "@/lib/validation/reading-management";
import { getCurrentUser } from "@/server/auth";
import { getAnonId } from "@/server/identity";
import { readingsRepo } from "@/server/repo/readings";

async function ownerIds() {
  const [user, anonId] = await Promise.all([getCurrentUser(), getAnonId()]);
  return user ? [user.id, ...(anonId ? [anonId] : [])] : anonId ? [anonId] : [];
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }
  const parsed = bulkReadingsSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "参数校验失败", issues: parsed.error.issues },
      { status: 400 },
    );
  const owners = await ownerIds();
  if (!owners.length)
    return NextResponse.json({ error: "记录不存在或无权限" }, { status: 404 });
  try {
    if (parsed.data.action === "export") {
      const readings = await readingsRepo.exportByIds(parsed.data.ids, owners);
      return NextResponse.json({ readings });
    }
    await readingsRepo.bulk(parsed.data.action, parsed.data.ids, owners);
    return NextResponse.json({ ok: true, count: parsed.data.ids.length });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED_BULK")
      return NextResponse.json(
        { error: "记录不存在或无权限" },
        { status: 404 },
      );
    throw error;
  }
}
