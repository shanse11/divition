"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { READING_STYLES, type ReadingStyle } from "@/types/tarot";
import { cn } from "@/lib/utils";

interface StyleStepProps {
  value: ReadingStyle;
  onSelect: (style: ReadingStyle) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StyleStep({ value, onSelect, onNext, onBack }: StyleStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-2xl"
    >
      <h2 className="font-serif-cn text-center text-2xl font-bold text-[#f7f1e7]">
        你希望以怎样的语气听到解读?
      </h2>
      <p className="mt-3 text-center text-sm text-[#b9b4c8]">
        同样的牌面,可以有不同的讲述方式。
      </p>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(
          Object.entries(READING_STYLES) as Array<
            [ReadingStyle, (typeof READING_STYLES)[ReadingStyle]]
          >
        ).map(([key, style]) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={cn(
              "glass-card glass-card-hover rounded-xl p-5 text-center",
              value === key &&
                "border-[#d7b46a] bg-[rgba(215,180,106,0.1)] shadow-[0_0_20px_rgba(215,180,106,0.2)]",
            )}
            aria-pressed={value === key}
          >
            <p className="font-serif-cn text-[15px] font-bold text-[#f7f1e7]">
              {style.name}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-[#b9b4c8]">
              {style.description}
            </p>
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
          onClick={onNext}
          className="btn-gold-shimmer bg-[#d7b46a] text-[#1c1608] hover:bg-[#f2da9c]"
        >
          开始洗牌
        </Button>
      </div>
    </motion.div>
  );
}
