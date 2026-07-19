"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReadingStep } from "@/stores/reading-flow";

const steps: Array<{ key: ReadingStep; label: string }> = [
  { key: "category", label: "领域" },
  { key: "question", label: "问题" },
  { key: "spread", label: "牌阵" },
  { key: "style", label: "风格" },
  { key: "draw", label: "抽牌" },
];

interface ReadingStepperProps {
  current: ReadingStep;
  onNavigate?: (step: ReadingStep) => void;
}

export function ReadingStepper({ current, onNavigate }: ReadingStepperProps) {
  const currentIndex = steps.findIndex((step) => step.key === current);

  return (
    <ol
      aria-label="占卜步骤"
      className="mx-auto flex w-full max-w-md items-center justify-between"
    >
      {steps.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={step.key} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              disabled={!done || !onNavigate}
              onClick={() => onNavigate?.(step.key)}
              className={cn(
                "flex flex-col items-center gap-1.5",
                done && onNavigate && "cursor-pointer",
              )}
              aria-current={active ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-xs transition-all",
                  done
                    ? "border-[#d7b46a] bg-[rgba(215,180,106,0.15)] text-[#d7b46a]"
                    : active
                      ? "border-[#f2da9c] bg-[rgba(242,218,156,0.12)] text-[#f2da9c] shadow-[0_0_12px_rgba(242,218,156,0.35)]"
                      : "border-[rgba(185,180,200,0.25)] text-[#b9b4c8]/60",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-[11px]",
                  active ? "text-[#f2da9c]" : "text-[#b9b4c8]/70",
                )}
              >
                {step.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "mx-1 mb-5 h-px flex-1",
                  i < currentIndex
                    ? "bg-[rgba(215,180,106,0.5)]"
                    : "bg-[rgba(185,180,200,0.15)]",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
