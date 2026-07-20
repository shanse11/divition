"use client";

import { motion } from "framer-motion";
import { Clock3, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpreadPreview } from "@/components/tarot/SpreadPreview";
import { spreads } from "@/data/spreads";
import { cn } from "@/lib/utils";

interface SpreadStepProps {
  value: string | null;
  onSelect: (spreadId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function SpreadStep({
  value,
  onSelect,
  onNext,
  onBack,
}: SpreadStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="font-serif-cn text-center text-2xl font-bold text-[#f7f1e7]">
        选择一副牌阵
      </h2>
      <p className="mt-3 text-center text-sm text-[#b9b4c8]">
        问题简单就选轻盈的,心事复杂就交给更大的阵。
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {spreads.map((spread) => (
          <button
            key={spread.id}
            type="button"
            onClick={() => onSelect(spread.id)}
            className={cn(
              "glass-card glass-card-hover flex flex-col rounded-2xl p-5 text-left",
              value === spread.id &&
                "border-[#d7b46a] bg-[rgba(215,180,106,0.08)] shadow-[0_0_24px_rgba(215,180,106,0.18)]",
            )}
            aria-pressed={value === spread.id}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-serif-cn text-base font-bold text-[#f7f1e7]">
                  {spread.name}
                </h3>
                <p className="font-display mt-0.5 text-[9px] tracking-[0.16em] text-[#d7b46a]/80 uppercase">
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
              className="mt-3 rounded-lg border border-[rgba(215,180,106,0.1)] bg-[rgba(7,8,18,0.4)] p-2"
            />
            <p className="mt-3 flex-1 text-xs leading-relaxed text-[#b9b4c8]">
              {spread.description}
            </p>
            <div className="mt-3 flex items-center gap-3 text-[11px] text-[#b9b4c8]/80">
              <span className="inline-flex items-center gap-1">
                <Layers className="h-3 w-3 text-[#d7b46a]" />
                {spread.cardCount} 张
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-3 w-3 text-[#d7b46a]" />约{" "}
                {spread.estimatedMinutes} 分钟
              </span>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-8 flex justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-[#b9b4c8] hover:text-[#f7f1e7]"
        >
          上一步
        </Button>
        <Button
          disabled={!value}
          onClick={onNext}
          className="btn-gold-shimmer bg-[#d7b46a] text-[#1c1608] hover:bg-[#f2da9c] disabled:opacity-40"
        >
          下一步
        </Button>
      </div>
    </motion.div>
  );
}
