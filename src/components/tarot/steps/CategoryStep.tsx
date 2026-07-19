"use client";

import { motion } from "framer-motion";
import { READING_CATEGORIES, type ReadingCategory } from "@/types/tarot";
import { cn } from "@/lib/utils";

interface CategoryStepProps {
  value: ReadingCategory | null;
  onSelect: (category: ReadingCategory) => void;
}

export function CategoryStep({ value, onSelect }: CategoryStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="font-serif-cn text-center text-2xl font-bold text-[#f7f1e7]">
        此刻,你想探寻哪个方向?
      </h2>
      <p className="mt-3 text-center text-sm text-[#b9b4c8]">
        选择一个领域,牌面会更聚焦地回应你。
      </p>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          Object.entries(READING_CATEGORIES) as Array<
            [ReadingCategory, (typeof READING_CATEGORIES)[ReadingCategory]]
          >
        ).map(([key, category]) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={cn(
              "glass-card glass-card-hover rounded-xl p-5 text-center transition-colors",
              value === key &&
                "border-[#d7b46a] bg-[rgba(215,180,106,0.1)] shadow-[0_0_20px_rgba(215,180,106,0.2)]",
            )}
          >
            <p className="font-serif-cn text-[15px] font-bold text-[#f7f1e7]">
              {category.name}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-[#b9b4c8]">
              {category.description}
            </p>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
