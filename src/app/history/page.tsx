import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/layout/SiteShell";
import { HistoryManager } from "@/components/tarot/HistoryManager";
import { readingsRepo } from "@/server/repo/readings";
import { getCurrentUser } from "@/server/auth";
import { getAnonId } from "@/server/identity";

export const metadata: Metadata = { title: "历史记录" };

export default async function HistoryPage() {
  const [user, anonId] = await Promise.all([getCurrentUser(), getAnonId()]);
  const ownerIds = user
    ? [user.id, ...(anonId ? [anonId] : [])]
    : anonId
      ? [anonId]
      : [];
  const pageSize = 20;
  const page = ownerIds.length
    ? await readingsRepo.listByOwner(ownerIds, { limit: pageSize }, true)
    : [];
  const readings = page.slice(0, pageSize);
  const nextCursor =
    page.length > pageSize ? (readings.at(-1)?.id ?? null) : null;

  return (
    <SiteShell>
      <main className="mx-auto max-w-5xl px-4 pt-28 pb-20 sm:px-6">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-xs tracking-[0.3em] text-[#d7b46a] uppercase">
              Your Archive
            </p>
            <h1 className="font-serif-cn mt-3 text-3xl font-bold text-[#f7f1e7]">
              占卜记录
            </h1>
            <p className="mt-2 text-sm text-[#b9b4c8]">
              回望每一次提问,也回望当时的自己。记录默认仅你可见。
            </p>
          </div>
          {!user && (
            <Link href="/login" className="text-sm text-[#d7b46a]">
              登录以同步记录 →
            </Link>
          )}
        </header>
        {readings.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <p className="font-serif-cn text-xl text-[#f2da9c]">这里还很安静</p>
            <p className="mt-3 text-sm text-[#b9b4c8]">
              完成第一次占卜后,你的星语会留在这里。
            </p>
            <Link
              href="/tarot"
              className="mt-6 inline-flex rounded-lg bg-[#d7b46a] px-5 py-3 text-sm text-[#1c1608]"
            >
              开始占卜
            </Link>
          </div>
        ) : (
          <HistoryManager
            initialReadings={readings}
            initialNextCursor={nextCursor}
          />
        )}
      </main>
    </SiteShell>
  );
}
