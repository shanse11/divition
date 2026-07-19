import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { ReadingFlow } from "@/components/tarot/ReadingFlow";
import { LoadingOracle } from "@/components/feedback/LoadingOracle";

export const metadata: Metadata = {
  title: "占卜进行中",
  description: "选择领域、写下问题、挑选牌阵,在洗牌与翻牌的仪式中完成占卜。",
  robots: { index: false },
};

export default function TarotReadingPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-5xl px-4 pt-28 pb-20 sm:px-6 lg:px-8">
        <Suspense fallback={<LoadingOracle />}>
          <ReadingFlow />
        </Suspense>
      </main>
    </SiteShell>
  );
}
