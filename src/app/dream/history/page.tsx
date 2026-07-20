import Link from "next/link";
import { SiteShell } from "@/components/layout/SiteShell";
import { getAnonId } from "@/server/identity";
import { getCurrentUser } from "@/server/auth";
import { dreamsRepo } from "@/server/repo/dreams";

export const metadata = { title: "梦境记录" };

export default async function DreamHistoryPage() {
  const user = await getCurrentUser();
  const anonId = await getAnonId();
  const ids = user
    ? [user.id, ...(anonId ? [anonId] : [])]
    : anonId
      ? [anonId]
      : [];
  const dreams = ids.length ? await dreamsRepo.listByOwner(ids) : [];
  return (
    <SiteShell>
      <main className="mx-auto max-w-5xl px-4 pt-28 pb-20 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-display text-xs tracking-[0.3em] text-[#d7b46a] uppercase">
              Dream Journal
            </p>
            <h1 className="font-serif-cn mt-3 text-3xl font-bold text-[#f7f1e7]">
              梦境记录
            </h1>
          </div>
          <Link
            href="/dream"
            className="rounded-lg bg-[#d7b46a] px-4 py-2 text-sm text-[#1c1608]"
          >
            记录新梦
          </Link>
        </div>
        {dreams.length === 0 ? (
          <div className="glass-card mt-8 rounded-2xl p-10 text-center text-sm text-[#b9b4c8]">
            还没有梦境记录。
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {dreams.map((dream) => (
              <Link
                key={dream.id}
                href={`/dream/${dream.id}`}
                className="glass-card rounded-2xl p-5 transition hover:border-[#d7b46a]/60"
              >
                <p className="text-xs text-[#b9b4c8]">
                  {new Date(dream.createdAt).toLocaleString("zh-CN")}
                </p>
                <h2 className="font-serif-cn mt-2 text-xl font-bold text-[#f7f1e7]">
                  {dream.title || dream.result.theme}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#b9b4c8]">
                  {dream.input.content}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </SiteShell>
  );
}
