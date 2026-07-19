import { cn } from "@/lib/utils";
import type { TarotSpread } from "@/data/spreads";

interface SpreadPreviewProps {
  spread: TarotSpread;
  className?: string;
  /** 高亮的位置索引(抽牌流程中使用) */
  activeIndex?: number;
  /** 已填充的位置数量 */
  filledCount?: number;
}

/** 牌阵布局的微缩可视化预览 */
export function SpreadPreview({
  spread,
  className,
  activeIndex,
  filledCount = 0,
}: SpreadPreviewProps) {
  return (
    <div
      className={cn("relative aspect-[4/3] w-full", className)}
      role="img"
      aria-label={`${spread.name}牌阵布局,共 ${spread.cardCount} 张牌`}
    >
      {spread.positions.map((pos) => {
        const filled = pos.index < filledCount;
        const active = pos.index === activeIndex;
        return (
          <div
            key={pos.index}
            className={cn(
              "absolute h-[26%] w-[13%] rounded-[3px] border transition-all duration-300",
              filled
                ? "border-[#d7b46a] bg-[rgba(215,180,106,0.35)]"
                : active
                  ? "border-[#f2da9c] bg-[rgba(242,218,156,0.15)] shadow-[0_0_10px_rgba(242,218,156,0.4)]"
                  : "border-[rgba(215,180,106,0.4)] bg-[rgba(215,180,106,0.06)]",
            )}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: `translate(-50%, -50%) rotate(${pos.rotate ?? 0}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}
