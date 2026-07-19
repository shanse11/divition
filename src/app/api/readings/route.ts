import { NextResponse, type NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { createReadingSchema } from "@/lib/validation/reading";
import { interpretTarot } from "@/lib/ai/interpret";
import { readingsRepo } from "@/server/repo/readings";
import { ensureAnonId } from "@/server/identity";
import { checkRateLimit } from "@/server/rate-limit";

export async function POST(request: NextRequest) {
  const ownerId = await ensureAnonId();

  const limited = checkRateLimit(`reading:${ownerId}`, 10, 60_000);
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
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const parsed = createReadingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "参数校验失败", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const id = nanoid(14);

  const { interpretation } = await interpretTarot(input);

  await readingsRepo.create({
    id,
    ownerId,
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
