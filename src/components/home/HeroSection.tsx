"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Sparkles, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TarotCardBack } from "@/components/tarot/TarotCardBack";
import { TarotCardFace } from "@/components/tarot/TarotCardFace";
import { MoonPhase } from "@/components/background/MoonPhase";

const floatingCards = [
  { rotate: -14, x: "-9rem", y: "1.5rem", delay: 0.15, z: 1, back: true },
  { rotate: 0, x: "0rem", y: "0rem", delay: 0, z: 3, back: false },
  { rotate: 14, x: "9rem", y: "1.5rem", delay: 0.3, z: 2, back: true },
] as const;

export function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 pt-20 pb-16">
      <MoonPhase className="top-24 right-[8%] hidden md:block" size={110} />

      <motion.div
        initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto max-w-3xl text-center"
      >
        <p className="font-display mb-5 text-xs tracking-[0.4em] text-[#d7b46a] uppercase">
          Astral Oracle
        </p>
        <h1 className="font-serif-cn text-4xl leading-snug font-bold text-balance text-[#f7f1e7] sm:text-5xl lg:text-6xl">
          答案并不在远方
          <br />
          <span className="text-gold-gradient">它藏在你已知晓的心中</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#b9b4c8] sm:text-lg">
          静下心,提出你的问题。让塔罗牌与星辰为你映照内心,
          在洗牌与翻牌之间,遇见那个早已知道方向的自己。
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="btn-gold-shimmer h-12 min-w-44 bg-[#d7b46a] text-base text-[#1c1608] hover:bg-[#f2da9c]"
          >
            <Link href="/tarot">
              <Sparkles className="h-5 w-5" />
              开始占卜
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 min-w-44 border-[rgba(215,180,106,0.4)] bg-transparent text-base text-[#f2da9c] hover:bg-[rgba(215,180,106,0.08)] hover:text-[#f7f1e7]"
          >
            <Link href="/daily">
              <Sun className="h-5 w-5" />
              抽取今日之牌
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* 中央漂浮卡牌 */}
      <div className="perspective-1200 relative z-0 mt-14 hidden h-64 w-full max-w-lg sm:block">
        {floatingCards.map((card, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 w-36"
            style={{ zIndex: card.z, x: "-50%" }}
            initial={{ opacity: 0, y: 60, rotate: 0 }}
            animate={{
              opacity: 1,
              y: reduceMotion ? 0 : [8, -8, 8],
              rotate: card.rotate,
              marginLeft: card.x,
              marginTop: card.y,
            }}
            transition={{
              opacity: { duration: 0.8, delay: 0.4 + card.delay },
              rotate: { duration: 0.8, delay: 0.4 + card.delay },
              y: reduceMotion
                ? { duration: 0.8 }
                : {
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: card.delay * 2,
                  },
            }}
          >
            {card.back ? (
              <TarotCardBack />
            ) : (
              <TarotCardFace
                name="星星"
                nameEn="The Star"
                label="XVII"
                seed={17}
                suit="major"
                className="text-[16px]"
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* 移动端单卡展示 */}
      <div className="relative z-0 mt-12 w-32 sm:hidden">
        <motion.div
          animate={reduceMotion ? {} : { y: [6, -6, 6] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <TarotCardFace
            name="星星"
            nameEn="The Star"
            label="XVII"
            seed={17}
            suit="major"
            className="text-[14px]"
          />
        </motion.div>
      </div>

      {/* 向下滚动提示 */}
      <motion.div
        aria-hidden
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#b9b4c8]/60"
        animate={reduceMotion ? {} : { y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="h-6 w-6" />
      </motion.div>
    </section>
  );
}
