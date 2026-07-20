import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock3, Layers, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { Badge } from "@/components/ui/badge";
import { SpreadPreview } from "@/components/tarot/SpreadPreview";
import { spreads } from "@/data/spreads";
import { READING_CATEGORIES } from "@/types/tarot";

export const metadata: Metadata = {
  title: "塔罗占卜大厅",
  description:
    "选择占卜领域与牌阵,开始一场与内心的对话。七种牌阵,从单牌指引到凯尔特十字。",
};

export default function TarotLobbyPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-6xl px-4 pt-28 pb-20 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <p className="font-display text-[11px] tracking-[0.35em] text-[#d7b46a] uppercase">
            Tarot Reading
          </p>
          <h1 className="font-serif-cn mt-3 text-3xl font-bold text-[#f7f1e7] sm:text-4xl">
            塔罗占卜大厅
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[#b9b4c8]">
            先想好你要问的方向,再挑一副合适的牌阵。
            无论问题轻重,这里都有一种铺开它的方式。
          </p>
          <Link
            href="/tarot/reading"
            className="btn-gold-shimmer mt-8 inline-flex h-12 items-center gap-2 rounded-lg bg-[#d7b46a] px-8 text-base font-medium text-[#1c1608] transition-colors hover:bg-[#f2da9c]"
          >
            <Sparkles className="h-5 w-5" />
            直接开始占卜
          </Link>
        </header>

        {/* 占卜领域 */}
        <section aria-labelledby="categories-heading" className="mt-20">
          <h2
            id="categories-heading"
            className="font-serif-cn text-center text-2xl font-bold text-[#f7f1e7]"
          >
            你想问哪个方向?
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(READING_CATEGORIES).map(([key, category]) => (
              <Link
                key={key}
                href={`/tarot/reading?category=${key}`}
                className="glass-card glass-card-hover rounded-xl p-5 text-center"
              >
                <p className="font-serif-cn text-[15px] font-bold text-[#f7f1e7]">
                  {category.name}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#b9b4c8]">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* 全部牌阵 */}
        <section aria-labelledby="spreads-heading" className="mt-20">
          <h2
            id="spreads-heading"
            className="font-serif-cn text-center text-2xl font-bold text-[#f7f1e7]"
          >
            全部牌阵
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {spreads.map((spread) => (
              <Link
                key={spread.id}
                href={`/tarot/reading?spread=${spread.id}`}
                className="glass-card glass-card-hover group flex h-full flex-col rounded-2xl p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-serif-cn text-lg font-bold text-[#f7f1e7]">
                      {spread.name}
                    </h3>
                    <p className="font-display mt-0.5 text-[10px] tracking-[0.18em] text-[#d7b46a]/80 uppercase">
                      {spread.nameEn}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="shrink-0 border-[rgba(215,180,106,0.35)] text-[#d7b46a]"
                  >
                    {spread.difficulty}
                  </Badge>
                </div>
                <SpreadPreview
                  spread={spread}
                  className="mt-4 rounded-xl border border-[rgba(215,180,106,0.1)] bg-[rgba(7,8,18,0.4)] p-3"
                />
                <p className="mt-4 flex-1 text-sm leading-relaxed text-[#b9b4c8]">
                  {spread.description}
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {spread.scenarios.map((scenario) => (
                    <li
                      key={scenario}
                      className="rounded-full border border-[rgba(215,180,106,0.2)] px-2.5 py-0.5 text-[11px] text-[#b9b4c8]"
                    >
                      {scenario}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center gap-4 text-xs text-[#b9b4c8]/80">
                  <span className="inline-flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-[#d7b46a]" />
                    {spread.cardCount} 张牌
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5 text-[#d7b46a]" />约{" "}
                    {spread.estimatedMinutes} 分钟
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1 text-[#d7b46a] transition-colors group-hover:text-[#f2da9c]">
                    选择
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
