"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[70svh] items-center justify-center px-4 py-24">
      <section
        className="glass-card w-full max-w-lg rounded-2xl p-8 text-center sm:p-12"
        role="alert"
        aria-labelledby="error-title"
      >
        <p className="font-display text-xs tracking-[0.3em] text-[#d7b46a] uppercase">
          A quiet interruption
        </p>
        <h1
          id="error-title"
          className="font-serif-cn mt-3 text-3xl font-bold text-[#f7f1e7]"
        >
          星雾暂时遮住了这条路
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#b9b4c8]">
          页面遇到了一点意外,没有敏感详情需要你处理。请稍后再试。
        </p>
        <Button
          type="button"
          onClick={() => unstable_retry()}
          className="btn-gold-shimmer mt-8 h-11 bg-[#d7b46a] px-6 text-[#1c1608] hover:bg-[#f2da9c]"
        >
          再试一次
        </Button>
      </section>
    </main>
  );
}
