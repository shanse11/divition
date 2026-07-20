"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface TarotCardFaceProps {
  /** 牌名(中文) */
  name: string;
  /** 牌名(英文) */
  nameEn: string;
  /** 罗马数字或花色序号标签,如 "Ⅷ" 或 "VII · 圣杯" */
  label: string;
  /** 用于生成确定性抽象插画的种子 */
  seed: number;
  /** 花色符号: wands/cups/swords/pentacles/major */
  suit: "wands" | "cups" | "swords" | "pentacles" | "major";
  /** 已核验的本地牌面；加载失败时回退原创抽象牌面。 */
  image?: string;
  /** 是否逆位展示(旋转180°) */
  reversed?: boolean;
  className?: string;
}

const SUIT_GLYPHS: Record<TarotCardFaceProps["suit"], string> = {
  major: "✶",
  wands: "⚚",
  cups: "☾",
  swords: "⚔",
  pentacles: "✪",
};

const SUIT_HUES: Record<TarotCardFaceProps["suit"], string> = {
  major: "#d7b46a",
  wands: "#d78d6a",
  cups: "#6a9ed7",
  swords: "#a8a8c8",
  pentacles: "#8fd76a",
};

/** 确定性伪随机,同一张牌插画永远一致 */
function mulberry(seed: number) {
  let a = seed + 0x6d2b79f5;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 原创占位牌面:牌名 + 编号 + 花色符号 + 基于种子的抽象星轨插画。
 * 后续可整体替换为真实插画(数据层已预留 image 字段)。
 */
export function TarotCardFace({
  name,
  nameEn,
  label,
  seed,
  suit,
  image,
  reversed = false,
  className,
}: TarotCardFaceProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const rand = mulberry(seed * 7919);
  const hue = SUIT_HUES[suit];
  const orbits = Array.from({ length: 3 }, (_, i) => ({
    cx: 35 + rand() * 50,
    cy: 55 + rand() * 40,
    r: 14 + i * 9 + rand() * 6,
    dash: 2 + rand() * 5,
  }));
  const sparks = Array.from({ length: 7 }, () => ({
    x: 18 + rand() * 84,
    y: 34 + rand() * 86,
    r: 0.7 + rand() * 1.3,
  }));

  return (
    <div
      className={cn(
        "relative aspect-[3/5] w-full overflow-hidden rounded-xl border border-[rgba(215,180,106,0.55)]",
        reversed && "rotate-180",
        className,
      )}
      style={{
        background:
          "linear-gradient(165deg, #191b30 0%, #10122a 60%, #151428 100%)",
        boxShadow:
          "0 1px 0 rgba(242,218,156,0.18) inset, 0 12px 32px -12px rgba(0,0,0,0.8)",
      }}
    >
      {image && !imageFailed ? (
        <Image
          src={image}
          alt={`${name}（${nameEn}）${reversed ? "逆位" : "正位"}牌面`}
          fill
          sizes="(max-width: 640px) 40vw, 180px"
          className="object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <>
          <div className="absolute inset-[5%] rounded-lg border border-[rgba(215,180,106,0.3)]" />
          {/* 顶部编号 */}
          <div className="absolute inset-x-0 top-[6%] text-center">
            <span className="font-display text-[0.55em] tracking-[0.25em] text-[#d7b46a]">
              {label}
            </span>
          </div>
          {/* 抽象星轨插画 */}
          <svg
            aria-hidden
            viewBox="0 0 120 200"
            className="absolute inset-0 h-full w-full"
            fill="none"
          >
            {orbits.map((o, i) => (
              <ellipse
                key={i}
                cx={o.cx}
                cy={o.cy}
                rx={o.r}
                ry={o.r * 0.62}
                stroke={hue}
                strokeWidth="0.7"
                strokeDasharray={`${o.dash} ${o.dash * 1.6}`}
                opacity={0.55 - i * 0.12}
                transform={`rotate(${i * 32 - 30} ${o.cx} ${o.cy})`}
              />
            ))}
            {sparks.map((s, i) => (
              <circle
                key={i}
                cx={s.x}
                cy={s.y}
                r={s.r}
                fill="#f2da9c"
                opacity="0.75"
              />
            ))}
            <circle cx="60" cy="92" r="4" fill={hue} opacity="0.9" />
            <circle
              cx="60"
              cy="92"
              r="8.5"
              stroke={hue}
              strokeWidth="0.6"
              opacity="0.5"
            />
          </svg>
          {/* 花色符号 */}
          <div
            className="absolute inset-x-0 top-[38%] text-center text-[1.6em]"
            style={{ color: hue }}
          >
            {SUIT_GLYPHS[suit]}
          </div>
          {/* 牌名 */}
          <div className="absolute inset-x-2 bottom-[7%] text-center">
            <p className="font-serif-cn text-[0.72em] leading-tight font-bold text-[#f7f1e7]">
              {name}
            </p>
            <p className="font-display mt-0.5 text-[0.42em] tracking-[0.14em] text-[#b9b4c8] uppercase">
              {nameEn}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
