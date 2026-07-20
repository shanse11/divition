import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { DreamForm } from "@/components/dream/DreamForm";

export const metadata: Metadata = { title: "AI 解梦" };

export default function DreamPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-5xl px-4 pt-28 pb-20 sm:px-6">
        <header className="mb-10 text-center">
          <p className="font-display text-xs tracking-[0.3em] text-[#d7b46a] uppercase">
            Dream Journal
          </p>
          <h1 className="font-serif-cn mt-3 text-3xl font-bold text-[#f7f1e7] sm:text-4xl">
            把梦说给星空听
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#b9b4c8]">
            不寻找唯一答案,只为那些仍在心里回响的画面,留出一点被理解的空间。
          </p>
        </header>
        <DreamForm />
      </main>
    </SiteShell>
  );
}
