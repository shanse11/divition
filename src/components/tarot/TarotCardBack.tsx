import { cn } from "@/lib/utils";

interface TarotCardBackProps {
  className?: string;
}

/**
 * 原创卡背设计:深蓝底、金色细边、中心月相与星芒图案。
 * 尺寸由父级控制(aspect-[3/5])。
 */
export function TarotCardBack({ className }: TarotCardBackProps) {
  return (
    <div
      className={cn(
        "relative aspect-[3/5] w-full overflow-hidden rounded-xl border border-[rgba(215,180,106,0.5)]",
        className,
      )}
      style={{
        background:
          "linear-gradient(160deg, #141633 0%, #0e1026 55%, #131230 100%)",
        boxShadow:
          "0 1px 0 rgba(242,218,156,0.15) inset, 0 12px 32px -12px rgba(0,0,0,0.8)",
      }}
    >
      {/* 内层细金框 */}
      <div className="absolute inset-[6%] rounded-lg border border-[rgba(215,180,106,0.35)]" />
      <svg
        aria-hidden
        viewBox="0 0 120 200"
        className="absolute inset-0 h-full w-full"
        fill="none"
      >
        {/* 中心月相 */}
        <circle
          cx="60"
          cy="100"
          r="26"
          stroke="#d7b46a"
          strokeWidth="1"
          opacity="0.9"
        />
        <path
          d="M60 74a26 26 0 1 0 0 52 20 20 0 1 1 0-52Z"
          fill="#d7b46a"
          opacity="0.55"
        />
        {/* 星芒 */}
        {[
          [60, 40],
          [60, 160],
          [24, 100],
          [96, 100],
        ].map(([x, y], i) => (
          <path
            key={i}
            d={`M${x} ${y - 6} L${x + 1.8} ${y - 1.8} L${x + 6} ${y} L${x + 1.8} ${y + 1.8} L${x} ${y + 6} L${x - 1.8} ${y + 1.8} L${x - 6} ${y} L${x - 1.8} ${y - 1.8} Z`}
            fill="#f2da9c"
            opacity="0.8"
          />
        ))}
        {/* 四角装饰 */}
        {[
          [16, 22, 1],
          [104, 22, -1],
          [16, 178, 1],
          [104, 178, -1],
        ].map(([x, y, dir], i) => (
          <path
            key={`c${i}`}
            d={`M${x} ${y} q ${8 * dir} 0 ${8 * dir} ${y < 100 ? 8 : -8}`}
            stroke="#d7b46a"
            strokeWidth="0.8"
            opacity="0.6"
          />
        ))}
        {/* 细点星尘 */}
        {[
          [38, 62],
          [82, 62],
          [38, 138],
          [82, 138],
          [60, 22],
          [60, 178],
          [30, 100],
          [90, 100],
        ].map(([x, y], i) => (
          <circle
            key={`d${i}`}
            cx={x}
            cy={y}
            r="0.9"
            fill="#f2da9c"
            opacity="0.7"
          />
        ))}
      </svg>
    </div>
  );
}
