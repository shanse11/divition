"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const PHASES = [
  "正在倾听你的问题",
  "正在连接牌面之间的线索",
  "正在解读当前能量",
  "正在整理最终指引",
];

/** AI 解读中的神秘加载动画:旋转星环 + 分阶段文字 */
export function LoadingOracle() {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase((p) => Math.min(p + 1, PHASES.length - 1));
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="relative h-32 w-32">
        {/* 外环 */}
        <motion.div
          className="absolute inset-0 rounded-full border border-[rgba(215,180,106,0.3)]"
          style={{ borderTopColor: "#d7b46a" }}
          animate={reduceMotion ? {} : { rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        {/* 中环 */}
        <motion.div
          className="absolute inset-4 rounded-full border border-[rgba(117,98,168,0.35)]"
          style={{ borderBottomColor: "#7562a8" }}
          animate={reduceMotion ? {} : { rotate: -360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />
        {/* 中心星 */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-2xl text-[#f2da9c]"
          animate={
            reduceMotion ? {} : { scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }
          }
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        >
          ✶
        </motion.div>
      </div>
      <motion.p
        key={phase}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-serif-cn mt-8 text-base text-[#f2da9c]"
      >
        {PHASES[phase]}
      </motion.p>
      <p className="mt-2 text-xs text-[#b9b4c8]/60">
        牌面的讯息正在汇聚,请稍候
      </p>
    </div>
  );
}
