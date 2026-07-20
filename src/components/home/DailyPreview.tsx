"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, LoaderCircle, Sun } from "lucide-react";
import { getCardById } from "@/data/tarot-cards";
import { TarotCardBack } from "@/components/tarot/TarotCardBack";

interface DailyPreviewPayload {
  cardId: string;
  reversed: boolean;
}

export function DailyPreview() {
  const [daily, setDaily] = useState<DailyPreviewPayload | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/daily")
      .then(async (response) => {
        if (!response.ok) throw new Error("daily request failed");
        return (await response.json()) as DailyPreviewPayload;
      })
      .then((payload) => active && setDaily(payload))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const card = daily ? getCardById(daily.cardId) : null;

  return (
    <div className="glass-card relative flex h-full flex-col justify-between overflow-hidden rounded-2xl p-8">
      <div className="relative z-10 max-w-sm">
        <p className="font-display text-[11px] tracking-[0.35em] text-[#d7b46a] uppercase">
          Daily Card
        </p>
        <h3 className="font-serif-cn mt-3 text-2xl font-bold text-[#f7f1e7]">
          今日之牌,正在等你翻开
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[#b9b4c8]">
          {card
            ? `${card.name} · ${daily?.reversed ? "逆位" : "正位"}。`
            : "每天一张专属于你的牌,作为温柔的自我觉察线索。"}
          同一天里刷新页面,它会安静地保持原样。
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/daily"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[rgba(215,180,106,0.4)] px-5 py-2.5 text-sm text-[#f2da9c] transition-colors hover:bg-[rgba(215,180,106,0.1)] focus-visible:ring-2 focus-visible:ring-[#d7b46a] focus-visible:outline-none"
          >
            <Sun className="h-4 w-4" aria-hidden="true" />
            查看今日之牌
          </Link>
          <span
            className="inline-flex items-center gap-1 text-xs text-[#b9b4c8]"
            role="status"
            aria-live="polite"
          >
            {!daily && (
              <LoaderCircle
                className="h-3.5 w-3.5 animate-spin"
                aria-hidden="true"
              />
            )}{" "}
            {daily ? "今日牌面已准备好" : "正在连接今日星象"}
          </span>
        </div>
      </div>
      <div
        className="absolute -right-6 -bottom-10 w-36 rotate-12 opacity-80 sm:w-44"
        aria-hidden="true"
      >
        <TarotCardBack />
      </div>
      <ArrowRight
        className="absolute top-8 right-8 h-5 w-5 text-[#d7b46a]/50"
        aria-hidden="true"
      />
    </div>
  );
}
