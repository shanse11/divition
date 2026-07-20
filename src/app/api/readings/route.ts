import { NextResponse, type NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { createReadingSchema } from "@/lib/validation/reading";
import { readingQuerySchema } from "@/lib/validation/reading-management";
import { interpretTarot } from "@/lib/ai/interpret";
import { readingsRepo } from "@/server/repo/readings";
import { ensureAnonId, getAnonId } from "@/server/identity";
import { getCurrentUser } from "@/server/auth";
import { checkRateLimit } from "@/server/rate-limit";

async function currentOwnerIds() {
  const [user, anonId] = await Promise.all([getCurrentUser(), getAnonId()]);
  return user ? [user.id, ...(anonId ? [anonId] : [])] : anonId ? [anonId] : [];
}

export async function GET(request: NextRequest) {
  const raw = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = readingQuerySchema.safeParse(raw);
  if (!parsed.success)
    return NextResponse.json(
      { error: "参数校验失败", issues: parsed.error.issues },
      { status: 400 },
    );
  const ownerIds = await currentOwnerIds();
  const readings = await readingsRepo.listByOwner(ownerIds, parsed.data, true);
  const hasNext = readings.length > parsed.data.limit;
  return NextResponse.json({
    readings: readings.slice(0, parsed.data.limit),
    nextCursor: hasNext ? (readings[parsed.data.limit - 1]?.id ?? null) : null,
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  const anonId = await ensureAnonId();
  const ownerId = user?.id ?? anonId;
  if (!checkRateLimit(`reading:${ownerId}`, 10, 60_000).ok)
    return NextResponse.json(
      { error: "操作太频繁了,请稍后再试" },
      { status: 429 },
    );
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }
  const parsed = createReadingSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "参数校验失败", issues: parsed.error.issues },
      { status: 400 },
    );
  const input = parsed.data;
  const id = nanoid(14);
  const { interpretation } = await interpretTarot(input);
  await readingsRepo.create({
    id,
    ownerId,
    userId: user?.id ?? null,
    kind: input.kind,
    category: input.category,
    question: input.question,
    spreadId: input.spreadId,
    style: input.style,
    cards: input.cards,
    interpretation,
    favorite: false,
    note: "",
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json({ id });
}
