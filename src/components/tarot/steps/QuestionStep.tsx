"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ReadingCategory } from "@/types/tarot";

const MAX_LENGTH = 120;

const examplesByCategory: Partial<Record<ReadingCategory, string[]>> = {
  general: ["接下来的一个月,我最需要留意什么?", "此刻我的生活正走向哪里?"],
  love: ["这段关系接下来会如何发展?", "我该如何面对现在的感情状态?"],
  career: ["现在是换工作的好时机吗?", "这个项目值得我继续投入吗?"],
  wealth: ["近期我的财务状况需要注意什么?", "我和金钱的关系是什么样的?"],
  social: ["我该如何处理和这位朋友的分歧?", "新环境里我要注意什么?"],
  growth: ["我现在最需要成长的部分是什么?", "是什么在悄悄消耗我的能量?"],
  yesno: ["我应该接受这个offer吗?", "现在告白合适吗?"],
  custom: ["写下任何盘旋在你心里的问题。"],
};

/** 过于模糊的问题模式 */
const VAGUE_PATTERNS = /^(怎么办|如何|为什么|好吗|行吗|嗯+|啊+|测一下|算一下|随便|不知道)[??。.!!]*$/;

interface QuestionStepProps {
  category: ReadingCategory;
  value: string;
  onSubmit: (question: string) => void;
  onBack: () => void;
}

export function QuestionStep({
  category,
  value,
  onSubmit,
  onBack,
}: QuestionStepProps) {
  const [question, setQuestion] = useState(value);
  const examples = useMemo(
    () => examplesByCategory[category] ?? examplesByCategory.general!,
    [category],
  );

  const trimmed = question.trim();
  const tooVague =
    trimmed.length > 0 && (trimmed.length < 4 || VAGUE_PATTERNS.test(trimmed));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-xl"
    >
      <h2 className="font-serif-cn text-center text-2xl font-bold text-[#f7f1e7]">
        把心里的疑问,写成一句话
      </h2>
      <p className="mt-3 text-center text-sm text-[#b9b4c8]">
        问题越具体,牌面的回应越清晰。也可以留空,接受一份今日指引。
      </p>

      <div className="mt-8">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value.slice(0, MAX_LENGTH))}
          placeholder="例如:这段关系接下来会如何发展?"
          rows={3}
          aria-label="占卜问题"
          className="glass-card resize-none border-[rgba(215,180,106,0.25)] text-[15px] text-[#f7f1e7] placeholder:text-[#b9b4c8]/50 focus-visible:ring-[rgba(215,180,106,0.4)]"
        />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span
            className={tooVague ? "text-[#d7b46a]" : "text-transparent"}
            role={tooVague ? "alert" : undefined}
          >
            这个问题有些抽象,试着加上具体的人、事或时间范围
          </span>
          <span className="text-[#b9b4c8]/60">
            {question.length}/{MAX_LENGTH}
          </span>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-[rgba(215,180,106,0.15)] bg-[rgba(215,180,106,0.04)] p-4">
        <p className="flex items-center gap-1.5 text-xs font-medium text-[#d7b46a]">
          <Lightbulb className="h-3.5 w-3.5" />
          可以这样问
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {examples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setQuestion(example)}
              className="rounded-full border border-[rgba(215,180,106,0.25)] px-3 py-1.5 text-xs text-[#b9b4c8] transition-colors hover:border-[#d7b46a] hover:text-[#f2da9c]"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-between gap-3">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-[#b9b4c8] hover:text-[#f7f1e7]"
        >
          上一步
        </Button>
        <div className="flex gap-3">
          {!trimmed && (
            <Button
              variant="outline"
              onClick={() => onSubmit("")}
              className="border-[rgba(215,180,106,0.35)] text-[#f2da9c] hover:bg-[rgba(215,180,106,0.08)]"
            >
              接受今日指引
            </Button>
          )}
          {trimmed && (
            <Button
              onClick={() => onSubmit(trimmed)}
              className="btn-gold-shimmer bg-[#d7b46a] text-[#1c1608] hover:bg-[#f2da9c]"
            >
              下一步
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
