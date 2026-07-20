"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Hand, Layers, Shuffle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TarotCardBack } from "@/components/tarot/TarotCardBack";
import { TarotCardFace } from "@/components/tarot/TarotCardFace";
import { drawCards } from "@/lib/tarot/draw";
import { getCardById } from "@/data/tarot-cards";
import type { TarotSpread } from "@/data/spreads";
import type { DrawnCard } from "@/types/tarot";
import { cn } from "@/lib/utils";
import { playSound } from "@/components/audio/MusicController";

type DrawPhase =
  "ready" | "shuffling" | "cutting" | "picking" | "revealing" | "done";

const PICK_POOL_SIZE = 22;

interface DrawStepProps {
  spread: TarotSpread;
  onComplete: (cards: DrawnCard[]) => void;
  onBack: () => void;
}

const PHASE_HINTS: Record<DrawPhase, string> = {
  ready: "深呼吸,在心中默念你的问题",
  shuffling: "牌正在洗切,让能量流动起来",
  cutting: "选择一叠,作为你的起点",
  picking: "凭直觉,依次点选卡牌",
  revealing: "牌面正在翻开",
  done: "牌阵已经铺开,准备好聆听了吗",
};

export function DrawStep({ spread, onComplete, onBack }: DrawStepProps) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<DrawPhase>("ready");
  const [pickedCount, setPickedCount] = useState(0);
  const [pickedPool, setPickedPool] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState(0);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms));
  }, []);

  const startShuffle = useCallback(() => {
    playSound("shuffle");
    setPhase("shuffling");
    setDrawnCards(drawCards(spread.cardCount));
    setPickedPool(new Set());
    setPickedCount(0);
    setRevealed(0);
    schedule(() => setPhase("cutting"), reduceMotion ? 300 : 2400);
  }, [spread.cardCount, schedule, reduceMotion]);

  const handleCut = useCallback(() => {
    playSound("button");
    setPhase("picking");
  }, []);

  const handlePick = useCallback(
    (poolIndex: number) => {
      if (pickedPool.has(poolIndex)) return;
      if (pickedCount >= spread.cardCount) return;
      playSound("pick");
      const next = pickedCount + 1;
      setPickedPool((prev) => new Set(prev).add(poolIndex));
      setPickedCount(next);
      if (next >= spread.cardCount) {
        schedule(() => {
          setPhase("revealing");
        }, 600);
      }
    },
    [pickedCount, pickedPool, spread.cardCount, schedule],
  );

  // 逐张翻牌
  useEffect(() => {
    if (phase !== "revealing") return;
    if (revealed >= spread.cardCount) {
      schedule(() => setPhase("done"), 500);
      return;
    }
    schedule(
      () => {
        playSound("flip");
        setRevealed((r) => r + 1);
      },
      reduceMotion ? 120 : 650,
    );
  }, [phase, revealed, spread.cardCount, schedule, reduceMotion]);

  const fanIndices = useMemo(
    () => Array.from({ length: PICK_POOL_SIZE }, (_, i) => i),
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center"
    >
      <h2 className="font-serif-cn text-center text-2xl font-bold text-[#f7f1e7]">
        {spread.name}
      </h2>
      <p
        className="mt-2 text-center text-sm text-[#d7b46a]"
        role="status"
        aria-live="polite"
      >
        {PHASE_HINTS[phase]}
      </p>
      {phase === "picking" && (
        <p className="mt-1 text-center text-xs text-[#b9b4c8]">
          已选 {pickedCount} / {spread.cardCount} 张
        </p>
      )}

      <div className="relative mt-8 w-full">
        {/* 准备阶段 */}
        {phase === "ready" && (
          <div className="flex flex-col items-center gap-8 py-10">
            <motion.div
              className="w-32 sm:w-36"
              animate={reduceMotion ? {} : { y: [4, -4, 4] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <TarotCardBack />
            </motion.div>
            <Button
              size="lg"
              onClick={startShuffle}
              className="btn-gold-shimmer h-12 bg-[#d7b46a] px-10 text-base text-[#1c1608] hover:bg-[#f2da9c]"
            >
              <Shuffle className="h-5 w-5" />
              开始洗牌
            </Button>
          </div>
        )}

        {/* 洗牌动画:一叠牌交错飞舞 */}
        {phase === "shuffling" && (
          <div className="relative mx-auto flex h-72 max-w-md items-center justify-center py-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-24 sm:w-28"
                initial={{ x: 0, y: 0, rotate: 0 }}
                animate={
                  reduceMotion
                    ? {}
                    : {
                        x: [
                          0,
                          (i % 2 ? 1 : -1) * (60 + i * 12),
                          0,
                          (i % 2 ? -1 : 1) * 40,
                          0,
                        ],
                        y: [0, -20 + (i % 3) * 14, 8, -12, 0],
                        rotate: [
                          0,
                          (i % 2 ? 1 : -1) * (10 + i * 3),
                          0,
                          (i % 2 ? -1 : 1) * 8,
                          0,
                        ],
                      }
                }
                transition={{
                  duration: 2.2,
                  ease: "easeInOut",
                  delay: i * 0.05,
                }}
                style={{ zIndex: i }}
              >
                <TarotCardBack />
              </motion.div>
            ))}
          </div>
        )}

        {/* 切牌 */}
        {phase === "cutting" && (
          <div className="flex flex-col items-center py-6">
            <div className="flex items-end justify-center gap-6 sm:gap-10">
              {[0, 1, 2].map((i) => (
                <motion.button
                  key={i}
                  type="button"
                  onClick={handleCut}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                  whileHover={reduceMotion ? {} : { y: -10, scale: 1.04 }}
                  className="w-24 cursor-pointer rounded-xl focus-visible:ring-2 focus-visible:ring-[#d7b46a] focus-visible:outline-none sm:w-28"
                  aria-label={`选择第${i + 1}叠牌`}
                >
                  <TarotCardBack />
                </motion.button>
              ))}
            </div>
            <p className="mt-6 flex items-center gap-1.5 text-xs text-[#b9b4c8]">
              <Hand className="h-3.5 w-3.5 text-[#d7b46a]" />
              轻触其中一叠完成切牌
            </p>
          </div>
        )}

        {/* 选牌:扇形排列 */}
        {phase === "picking" && (
          <div className="mx-auto max-w-3xl">
            <div className="flex scrollbar-none justify-start gap-0 overflow-x-auto px-6 py-10 sm:justify-center">
              {fanIndices.map((i) => {
                const picked = pickedPool.has(i);
                const mid = (PICK_POOL_SIZE - 1) / 2;
                const angle = (i - mid) * 2.4;
                return (
                  <motion.button
                    key={i}
                    type="button"
                    disabled={picked}
                    onClick={() => handlePick(i)}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{
                      opacity: picked ? 0 : 1,
                      y: picked ? -60 : 0,
                      scale: picked ? 0.6 : 1,
                    }}
                    transition={{
                      duration: 0.45,
                      delay: picked ? 0 : i * 0.025,
                    }}
                    whileHover={
                      picked || reduceMotion ? {} : { y: -18, zIndex: 40 }
                    }
                    className="-ml-6 w-14 shrink-0 cursor-pointer rounded-lg first:ml-0 focus-visible:ring-2 focus-visible:ring-[#d7b46a] focus-visible:outline-none sm:-ml-7 sm:w-16"
                    style={{
                      rotate: `${angle}deg`,
                      transformOrigin: "bottom center",
                    }}
                    aria-label={`抽取第${i + 1}张牌`}
                  >
                    <TarotCardBack />
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* 揭示与完成:牌阵布局 */}
        {(phase === "revealing" || phase === "done") && (
          <div
            className={cn(
              "relative mx-auto w-full max-w-2xl",
              spread.cardCount > 5 ? "aspect-[4/3.4]" : "aspect-[4/2.6]",
            )}
          >
            {spread.positions.map((pos) => {
              const drawn = drawnCards.find(
                (d) => d.positionIndex === pos.index,
              );
              const card = drawn ? getCardById(drawn.cardId) : undefined;
              const isRevealed = pos.index < revealed;
              const cardWidth = spread.cardCount > 5 ? "w-[14%]" : "w-[17%]";
              return (
                <div
                  key={pos.index}
                  className={cn("absolute", cardWidth)}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: `translate(-50%, -50%) rotate(${pos.rotate ?? 0}deg)`,
                    zIndex: pos.rotate ? 10 : 1,
                  }}
                >
                  <div className="perspective-1200">
                    <motion.div
                      className="preserve-3d relative"
                      initial={false}
                      animate={{ rotateY: isRevealed ? 180 : 0 }}
                      transition={{
                        duration: reduceMotion ? 0.05 : 0.7,
                        ease: [0.3, 0.1, 0.3, 1],
                      }}
                    >
                      <div className="backface-hidden">
                        <TarotCardBack />
                      </div>
                      <div
                        className="absolute inset-0 backface-hidden"
                        style={{ transform: "rotateY(180deg)" }}
                      >
                        {card && (
                          <TarotCardFace
                            name={card.name}
                            nameEn={card.nameEn}
                            label={card.label}
                            seed={card.index + 1}
                            suit={card.suit}
                            reversed={drawn?.reversed}
                            className="text-[9px] sm:text-[11px]"
                          />
                        )}
                      </div>
                    </motion.div>
                  </div>
                  <p className="mt-1.5 text-center text-[9px] text-[#b9b4c8] sm:text-[10px]">
                    {pos.name}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 底部操作 */}
      <div className="mt-10 flex w-full max-w-md items-center justify-between">
        {phase === "ready" ? (
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-[#b9b4c8] hover:text-[#f7f1e7]"
          >
            上一步
          </Button>
        ) : (
          <span />
        )}
        <AnimatePresence>
          {phase === "done" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button
                size="lg"
                onClick={() => onComplete(drawnCards)}
                className="btn-gold-shimmer h-12 bg-[#d7b46a] px-8 text-base text-[#1c1608] hover:bg-[#f2da9c]"
              >
                <Sparkles className="h-5 w-5" />
                聆听解读
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        {phase !== "done" && phase !== "ready" && (
          <span className="flex items-center gap-1.5 text-xs text-[#b9b4c8]/60">
            <Layers className="h-3.5 w-3.5" />共 {spread.cardCount} 张
          </span>
        )}
      </div>
    </motion.div>
  );
}
