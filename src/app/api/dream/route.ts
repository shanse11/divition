import { NextResponse, type NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { dreamInputSchema } from "@/lib/validation/dream";
import { interpretDream } from "@/lib/ai/interpret";
import { getCurrentUser } from "@/server/auth";
import { ensureAnonId, getAnonId } from "@/server/identity";
import { checkRateLimit } from "@/server/rate-limit";
import { dreamsRepo } from "@/server/repo/dreams";

function ownerIds(userId: string | undefined, anonId: string | null) {
  return userId
    ? [userId, ...(anonId ? [anonId] : [])]
    : anonId
      ? [anonId]
      : [];
}

export async function GET() {
  const user = await getCurrentUser();
  const anonId = await getAnonId();
  const ids = ownerIds(user?.id, anonId);
  const dreams = ids.length ? await dreamsRepo.listByOwner(ids) : [];
  return NextResponse.json({ dreams });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  const ownerId = user?.id ?? (await ensureAnonId());
  if (!checkRateLimit(`dream:${ownerId}`, 8, 60_000).ok) {
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
  const parsed = dreamInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "参数校验失败" },
      { status: 400 },
    );
  }

  const interpretation = await interpretDream(parsed.data);
  const dream = await dreamsRepo.create({
    id: nanoid(14),
    ownerId,
    userId: user?.id ?? null,
    input: parsed.data,
    result: interpretation.result,
  });
  return NextResponse.json(
    { id: dream.id, result: dream.result, source: interpretation.source },
    { status: 201 },
  );
}
