import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { DailyCardWidget } from "@/components/daily/DailyCardWidget";

export const metadata: Metadata = { title: "每日一牌" };

export default function DailyPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-5xl px-4 pt-28 pb-20 sm:px-6">
        <header className="mb-10 text-center">
          <p className="font-display text-xs tracking-[0.3em] text-[#d7b46a] uppercase">
            Daily Oracle
          </p>
          <h1 className="font-serif-cn mt-3 text-3xl font-bold text-[#f7f1e7] sm:text-4xl">
            今日之牌
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#b9b4c8]">
            同一天里,这张牌会为你保持不变。把它当作一枚温柔的自我觉察线索。
          </p>
        </header>
        <DailyCardWidget />
      </main>
    </SiteShell>
  );
}
