import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RotateCcw, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { ReadingResult } from "@/components/tarot/ReadingResult";
import { readingsRepo } from "@/server/repo/readings";
import { getAnonId } from "@/server/identity";
import { getCurrentUser } from "@/server/auth";
import { ReadingActions } from "@/components/tarot/ReadingActions";
import { getCardById } from "@/data/tarot-cards";
import { getSpreadById } from "@/data/spreads";
import { prisma } from "@/server/db";

export const metadata: Metadata = {
  title: "占卜结果",
  robots: { index: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReadingResultPage({ params }: PageProps) {
  const { id } = await params;
  const reading = await readingsRepo.findById(id);
  if (!reading) notFound();

  // 数据归属校验:只有创建者能查看
  const user = await getCurrentUser();
  const anonId = await getAnonId();
  const isOwner =
    (user && reading.ownerId === user.id) ||
    (anonId && reading.ownerId === anonId);
  if (!isOwner) notFound();

  const spread = getSpreadById(reading.spreadId);
  const defaultShowQuestion = user
    ? ((
        await prisma.userSettings.findUnique({
          where: { userId: user.id },
          select: { shareShowQuestion: true },
        })
      )?.shareShowQuestion ?? false)
    : false;
  const posterReading = {
    id: reading.id,
    question: reading.question,
    spread: {
      name: spread?.name ?? "塔罗牌阵",
      nameEn: spread?.nameEn ?? "Tarot Reading",
    },
    createdAt: reading.createdAt,
    theme: reading.interpretation?.theme ?? "一份来自牌面的指引",
    summary: reading.interpretation?.summary ?? "让牌面成为自我觉察的起点。",
    advice: reading.interpretation?.advice ?? [],
    disclaimer: reading.interpretation?.disclaimer ?? "仅供娱乐与自我反思",
    cards: reading.cards.flatMap((drawn) => {
      const card = getCardById(drawn.cardId);
      if (!card) return [];
      const item = reading.interpretation?.cards.find(
        (candidate) => candidate.positionIndex === drawn.positionIndex,
      );
      return [
        {
          id: card.id,
          name: card.name,
          nameEn: card.nameEn,
          label: card.label,
          suit: card.suit,
          image: card.image,
          seed: card.index + 1,
          position:
            item?.positionName ??
            spread?.positions.find(
              (position) => position.index === drawn.positionIndex,
            )?.name ??
            `牌位 ${drawn.positionIndex + 1}`,
          reversed: drawn.reversed,
          keywords:
            item?.keywords ??
            (drawn.reversed ? card.reversedKeywords : card.uprightKeywords),
          interpretation: item?.text,
        },
      ];
    }),
  };

  return (
    <SiteShell>
      <main className="mx-auto max-w-3xl px-4 pt-28 pb-20 sm:px-6 lg:px-8">
        <ReadingResult reading={reading} />
        <ReadingActions
          reading={posterReading}
          favorite={reading.favorite}
          note={reading.note}
          defaultShowQuestion={defaultShowQuestion}
        />
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/tarot/reading"
            className="btn-gold-shimmer inline-flex h-11 items-center gap-2 rounded-lg bg-[#d7b46a] px-6 text-sm font-medium text-[#1c1608] transition-colors hover:bg-[#f2da9c]"
          >
            <RotateCcw className="h-4 w-4" />
            再占一次
          </Link>
          <Link
            href="/history"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-[rgba(215,180,106,0.35)] px-6 text-sm text-[#f2da9c] transition-colors hover:bg-[rgba(215,180,106,0.08)]"
          >
            <Sparkles className="h-4 w-4" />
            查看历史记录
          </Link>
        </div>
      </main>
    </SiteShell>
  );
}
