import Link from "next/link";
import { ArrowRight, Clock3, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SpreadPreview } from "@/components/tarot/SpreadPreview";
import { featuredSpreads } from "@/data/spreads";
import { SectionHeading, SectionReveal } from "./SectionReveal";

export function SpreadsSection() {
  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8">
      <SectionReveal>
        <SectionHeading
          eyebrow="Spreads"
          title="为不同的问题,准备不同的牌阵"
          description="从一张牌的轻盈,到凯尔特十字的深邃。问题有多复杂,牌阵就有多完整。"
        />
      </SectionReveal>
      <div className="mx-auto mt-14 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {featuredSpreads.map((spread, i) => (
          <SectionReveal key={spread.id} delay={i * 0.06}>
            <Link
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
                  试试
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          </SectionReveal>
        ))}
      </div>
    </section>
  );
}
