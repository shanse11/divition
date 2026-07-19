import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RotateCcw, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { ReadingResult } from "@/components/tarot/ReadingResult";
import { readingsRepo } from "@/server/repo/readings";
import { getAnonId } from "@/server/identity";

export const metadata: Metadata = {
  title: "占卜结果",
  robots: { index: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReadingResultPage({ params }: PageProps) {
  const { id } = await params;
  const reading = await readingsRepo.findById(id);
  if (!reading) notFound();

  // 数据归属校验:只有创建者能查看
  const anonId = await getAnonId();
  if (reading.ownerId !== anonId) notFound();

  return (
    <SiteShell>
      <main className="mx-auto max-w-3xl px-4 pt-28 pb-20 sm:px-6 lg:px-8">
        <ReadingResult reading={reading} />
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/tarot/reading"
            className="btn-gold-shimmer inline-flex h-11 items-center gap-2 rounded-lg bg-[#d7b46a] px-6 text-sm font-medium text-[#1c1608] transition-colors hover:bg-[#f2da9c]"
          >
            <RotateCcw className="h-4 w-4" />
            再占一次
          </Link>
          <Link
            href="/history"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-[rgba(215,180,106,0.35)] px-6 text-sm text-[#f2da9c] transition-colors hover:bg-[rgba(215,180,106,0.08)]"
          >
            <Sparkles className="h-4 w-4" />
            查看历史记录
          </Link>
        </div>
      </main>
    </SiteShell>
  );
}
