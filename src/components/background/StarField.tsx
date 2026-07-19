"use client";

import { useMemo } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

interface StarFieldProps {
  /** 星星数量,移动端会自动折半 */
  count?: number;
  className?: string;
}

/** 基于确定性伪随机的静态星点层,CSS 动画闪烁,不引起重排 */
export function StarField({ count = 90, className }: StarFieldProps) {
  const stars = useMemo<Star[]>(() => {
    // 固定种子的 LCG,保证 SSR 与客户端渲染一致
    let seed = 20260719;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    return Array.from({ length: count }, () => ({
      x: rand() * 100,
      y: rand() * 100,
      size: 0.8 + rand() * 1.6,
      delay: rand() * 6,
      duration: 3 + rand() * 5,
      opacity: 0.3 + rand() * 0.7,
    }));
  }, [count]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {stars.map((star, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-[#f2da9c]"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
            boxShadow:
              star.size > 1.8
                ? "0 0 6px 1px rgba(242,218,156,0.45)"
                : undefined,
          }}
        />
      ))}
    </div>
  );
}
