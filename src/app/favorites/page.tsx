import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/layout/SiteShell";
import { readingsRepo } from "@/server/repo/readings";
import { getCurrentUser } from "@/server/auth";
import { getAnonId } from "@/server/identity";

export const metadata: Metadata = { title: "收藏" };

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  const anonId = await getAnonId();
  const ids = user
    ? [user.id, ...(anonId ? [anonId] : [])]
    : anonId
      ? [anonId]
      : [];
  const readings = ids.length
    ? (await readingsRepo.listByOwner(ids)).filter((item) => item.favorite)
    : [];
  return (
    <SiteShell>
      <main className="mx-auto max-w-4xl px-4 pt-28 pb-20 sm:px-6">
        <h1 className="font-serif-cn text-3xl font-bold text-[#f7f1e7]">
          收藏的星语
        </h1>
        <p className="mt-2 text-sm text-[#b9b4c8]">
          把值得反复阅读的指引留在这里。
        </p>
        <div className="mt-8 space-y-4">
          {readings.length ? (
            readings.map((reading) => (
              <Link
                key={reading.id}
                href={`/tarot/result/${reading.id}`}
                className="glass-card block rounded-2xl p-5"
              >
                <h2 className="font-serif-cn text-lg font-bold text-[#f2da9c]">
                  {reading.interpretation?.theme ?? "一次占卜"}
                </h2>
                <p className="mt-2 text-sm text-[#b9b4c8]">
                  {reading.interpretation?.summary}
                </p>
              </Link>
            ))
          ) : (
            <div className="glass-card rounded-2xl p-10 text-center text-[#b9b4c8]">
              还没有收藏。遇见想常常回看的指引时,点亮结果页的心形即可。
            </div>
          )}
        </div>
      </main>
    </SiteShell>
  );
}
