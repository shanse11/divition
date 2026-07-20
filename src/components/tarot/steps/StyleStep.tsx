"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { READING_STYLES, type ReadingStyle } from "@/types/tarot";
import { cn } from "@/lib/utils";
import { getSelectionCardClassName } from "@/components/tarot/steps/selection-card-style";

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
              "glass-card glass-card-hover rounded-xl p-5 text-center transition-[border-color,background-color,box-shadow,transform] duration-200",
              getSelectionCardClassName(value === key),
            )}
            aria-pressed={value === key}
          >
            {value === key && (
              <span className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#f2da9c] text-[#1c1608] shadow-[0_0_14px_rgba(242,218,156,0.5)]">
                <Check className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">已选择</span>
              </span>
            )}
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
