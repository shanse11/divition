import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { DreamDetail } from "@/components/dream/DreamDetail";
import { getCurrentUser } from "@/server/auth";
import { getAnonId } from "@/server/identity";
import { dreamsRepo } from "@/server/repo/dreams";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DreamDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [dream, user, anonId] = await Promise.all([
    dreamsRepo.findById(id),
    getCurrentUser(),
    getAnonId(),
  ]);
  if (!dream || (dream.ownerId !== user?.id && dream.ownerId !== anonId))
    notFound();
  return (
    <SiteShell>
      <main className="mx-auto max-w-4xl px-4 pt-28 pb-20 sm:px-6">
        <DreamDetail dream={dream} />
      </main>
    </SiteShell>
  );
}
