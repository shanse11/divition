import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCardById } from "@/data/tarot-cards";
import { getSpreadById } from "@/data/spreads";
import { SiteShell } from "@/components/layout/SiteShell";
import { TarotCardFace } from "@/components/tarot/TarotCardFace";
import { sharesRepo } from "@/server/repo/shares";
import type { Interpretation } from "@/types/reading";

export const metadata: Metadata = {
  title: "分享的占卜",
  robots: { index: false },
};

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const share = await sharesRepo.find(id);
  if (!share) notFound();

  let interpretation: Interpretation | null = null;
  try {
    interpretation = share.reading.interpretation
      ? (JSON.parse(share.reading.interpretation) as Interpretation)
      : null;
  } catch {
    interpretation = null;
  }
  const spread = getSpreadById(share.reading.spreadId);

  return (
    <SiteShell>
      <main className="mx-auto max-w-3xl px-4 pt-28 pb-20 sm:px-6">
        <header className="text-center">
          <p className="font-display text-xs tracking-[0.3em] text-[#d7b46a] uppercase">
            Astral Oracle
          </p>
          <h1 className="font-serif-cn mt-4 text-3xl font-bold text-[#f7f1e7]">
            {share.showQuestion
              ? (interpretation?.theme ?? "一份来自牌面的指引")
              : "一份来自牌面的指引"}
          </h1>
          {share.showQuestion && share.reading.question && (
            <p className="mt-4 text-sm text-[#b9b4c8] italic">
              「{share.reading.question}」
            </p>
          )}
        </header>
        <div className="mt-8 flex justify-center gap-4 overflow-x-auto px-2 py-3">
          {share.reading.draws
            .slice()
            .sort((a, b) => a.positionIndex - b.positionIndex)
            .map((draw) => {
              const card = getCardById(draw.cardId);
              if (!card) return null;
              return (
                <div key={draw.id} className="w-24 shrink-0 text-center">
                  <TarotCardFace
                    name={card.name}
                    nameEn={card.nameEn}
                    label={card.label}
                    seed={card.index + 1}
                    suit={card.suit}
                    reversed={draw.reversed}
                    className="text-[9px]"
                  />
                  <p className="mt-2 text-xs text-[#d7b46a]">
                    {spread?.positions[draw.positionIndex]?.name ??
                      `牌位 ${draw.positionIndex + 1}`}
                  </p>
                </div>
              );
            })}
        </div>
        {interpretation && (
          <div className="glass-card mt-6 space-y-5 rounded-2xl p-6 sm:p-8">
            <section>
              <h2 className="font-serif-cn text-lg font-bold text-[#f2da9c]">
                整体能量
              </h2>
              <p className="mt-2 leading-relaxed text-[#f7f1e7]/90">
                {interpretation.overview}
              </p>
            </section>
            <section>
              <h2 className="font-serif-cn text-lg font-bold text-[#f2da9c]">
                一句总结
              </h2>
              <p className="mt-2 leading-relaxed text-[#f7f1e7]/90">
                {interpretation.summary}
              </p>
            </section>
            <p className="text-center text-xs text-[#b9b4c8]/70">
              {interpretation.disclaimer}
            </p>
          </div>
        )}
      </main>
    </SiteShell>
  );
}
