"use client";

import { useMemo } from "react";

function seededRandom(index: number): number {
  let value = 20260719 + index * 2654435761;
  value = Math.imul(value ^ (value >>> 16), 2246822507);
  value = Math.imul(value ^ (value >>> 13), 3266489909);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

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
  const stars = useMemo<Star[]>(
    () =>
      Array.from({ length: count }, (_, index) => ({
        x: seededRandom(index * 6) * 100,
        y: seededRandom(index * 6 + 1) * 100,
        size: 0.8 + seededRandom(index * 6 + 2) * 1.6,
        delay: seededRandom(index * 6 + 3) * 6,
        duration: 3 + seededRandom(index * 6 + 4) * 5,
        opacity: 0.3 + seededRandom(index * 6 + 5) * 0.7,
      })),
    [count],
  );

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
