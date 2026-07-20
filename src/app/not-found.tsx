import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-[70svh] items-center justify-center px-4 py-24">
      <section
        className="glass-card w-full max-w-lg rounded-2xl p-8 text-center sm:p-12"
        aria-labelledby="not-found-title"
      >
        <Sparkles
          className="mx-auto h-8 w-8 text-[#d7b46a]"
          aria-hidden="true"
        />
        <p className="font-display mt-5 text-xs tracking-[0.3em] text-[#d7b46a] uppercase">
          404 · Lost among the stars
        </p>
        <h1
          id="not-found-title"
          className="font-serif-cn mt-3 text-3xl font-bold text-[#f7f1e7]"
        >
          这条星路暂时不存在
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#b9b4c8]">
          你寻找的页面已经隐入星雾,但还有许多入口等你探索。
        </p>
        <Button
          asChild
          className="btn-gold-shimmer mt-8 h-11 bg-[#d7b46a] px-6 text-[#1c1608] hover:bg-[#f2da9c]"
        >
          <Link href="/">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            返回首页
          </Link>
        </Button>
      </section>
    </main>
  );
}
