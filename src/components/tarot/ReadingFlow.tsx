"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ReadingStepper } from "@/components/tarot/ReadingStepper";
import { CategoryStep } from "@/components/tarot/steps/CategoryStep";
import { QuestionStep } from "@/components/tarot/steps/QuestionStep";
import { SpreadStep } from "@/components/tarot/steps/SpreadStep";
import { StyleStep } from "@/components/tarot/steps/StyleStep";
import { DrawStep } from "@/components/tarot/steps/DrawStep";
import { LoadingOracle } from "@/components/feedback/LoadingOracle";
import { useReadingFlow } from "@/stores/reading-flow";
import { getSpreadById } from "@/data/spreads";
import { READING_CATEGORIES, type DrawnCard, type ReadingCategory } from "@/types/tarot";

export function ReadingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const flow = useReadingFlow();
  const [submitting, setSubmitting] = useState(false);

  // 支持 ?spread= 和 ?category= 预选
  useEffect(() => {
    const spreadParam = searchParams.get("spread");
    const categoryParam = searchParams.get("category");
    if (categoryParam && categoryParam in READING_CATEGORIES) {
      flow.setCategory(categoryParam as ReadingCategory);
    }
    if (spreadParam && getSpreadById(spreadParam)) {
      flow.setSpreadId(spreadParam);
    }
    if (categoryParam && categoryParam in READING_CATEGORIES) {
      flow.setStep("question");
    }
    // 仅初始化时执行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spread = flow.spreadId ? getSpreadById(flow.spreadId) : undefined;

  const handleDrawComplete = useCallback(
    async (cards: DrawnCard[]) => {
      if (submitting) return;
      setSubmitting(true);
      try {
        const res = await fetch("/api/readings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: "tarot",
            category: flow.category ?? "general",
            question: flow.question,
            spreadId: flow.spreadId,
            style: flow.style,
            cards,
          }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(data?.error ?? "生成解读失败");
        }
        const data = (await res.json()) as { id: string };
        flow.reset();
        router.push(`/tarot/result/${data.id}`);
      } catch (error) {
        setSubmitting(false);
        toast.error(
          error instanceof Error ? error.message : "网络异常,请稍后再试",
        );
      }
    },
    [flow, router, submitting],
  );

  if (submitting) {
    return <LoadingOracle />;
  }

  return (
    <div>
      <ReadingStepper
        current={flow.step}
        onNavigate={(step) => flow.setStep(step)}
      />
      <div className="mt-12">
        <AnimatePresence mode="wait">
          {flow.step === "category" && (
            <CategoryStep
              key="category"
              value={flow.category}
              onSelect={(category) => {
                flow.setCategory(category);
                flow.setStep("question");
              }}
            />
          )}
          {flow.step === "question" && (
            <QuestionStep
              key="question"
              category={flow.category ?? "general"}
              value={flow.question}
              onSubmit={(question) => {
                flow.setQuestion(question);
                flow.setStep("spread");
              }}
              onBack={() => flow.setStep("category")}
            />
          )}
          {flow.step === "spread" && (
            <SpreadStep
              key="spread"
              value={flow.spreadId}
              onSelect={(id) => flow.setSpreadId(id)}
              onNext={() => flow.setStep("style")}
              onBack={() => flow.setStep("question")}
            />
          )}
          {flow.step === "style" && (
            <StyleStep
              key="style"
              value={flow.style}
              onSelect={(style) => flow.setStyle(style)}
              onNext={() => flow.setStep("draw")}
              onBack={() => flow.setStep("spread")}
            />
          )}
          {flow.step === "draw" && spread && (
            <DrawStep
              key="draw"
              spread={spread}
              onComplete={handleDrawComplete}
              onBack={() => flow.setStep("style")}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
