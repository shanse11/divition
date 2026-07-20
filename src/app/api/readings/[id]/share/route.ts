import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { readingsRepo } from "@/server/repo/readings";
import { sharesRepo } from "@/server/repo/shares";
import { getAnonId } from "@/server/identity";
import { getCurrentUser } from "@/server/auth";
import { checkRateLimit } from "@/server/rate-limit";

const createShareSchema = z.object({
  showQuestion: z.boolean().default(false),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const reading = await readingsRepo.findById(id);
  if (!reading) {
    return NextResponse.json({ error: "记录不存在" }, { status: 404 });
  }

  const user = await getCurrentUser();
  const anonId = await getAnonId();
  const ownerIds = user
    ? [user.id, ...(anonId ? [anonId] : [])]
    : anonId
      ? [anonId]
      : [];
  if (!ownerIds.includes(reading.ownerId)) {
    return NextResponse.json({ error: "无权分享此记录" }, { status: 403 });
  }

  const limited = checkRateLimit(`share:${reading.ownerId}`, 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "操作太频繁了,请稍后再试" },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const parsed = createShareSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "参数校验失败" }, { status: 400 });
  }

  const share = await sharesRepo.createForOwner(
    id,
    ownerIds,
    parsed.data.showQuestion,
  );
  if (!share) {
    return NextResponse.json({ error: "无权分享此记录" }, { status: 403 });
  }
  return NextResponse.json({ id: share.id, url: `/share/${share.id}` });
}
