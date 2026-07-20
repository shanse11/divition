import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/layout/SiteShell";
import { SettingsForm } from "@/components/account/SettingsForm";
import { DataRights } from "@/components/account/DataRights";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";

export const metadata: Metadata = { title: "设置" };
export default async function SettingsPage() {
  const user = await getCurrentUser();
  const settings = user
    ? await prisma.userSettings.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id },
        select: {
          defaultStyle: true,
          motionLevel: true,
          musicEnabled: true,
          musicVolume: true,
          shareShowQuestion: true,
        },
      })
    : null;
  return (
    <SiteShell>
      <main className="mx-auto max-w-3xl px-4 pt-28 pb-20 sm:px-6">
        <h1 className="font-serif-cn text-3xl font-bold text-[#f7f1e7]">
          设置
        </h1>
        <p className="mt-2 text-sm text-[#b9b4c8]">
          调整解读、动画、声音与分享偏好。
        </p>
        {user && settings ? (
          <>
            <SettingsForm
              settings={
                settings as {
                  defaultStyle: string;
                  motionLevel: "full" | "reduced";
                  musicEnabled: boolean;
                  musicVolume: number;
                  shareShowQuestion: boolean;
                }
              }
            />
            <DataRights />
          </>
        ) : (
          <div className="glass-card mt-8 rounded-2xl p-8 text-center">
            <p className="text-[#b9b4c8]">登录后可保存偏好并管理账号数据。</p>
            <Link
              href="/login"
              className="mt-5 inline-flex rounded-lg bg-[#d7b46a] px-5 py-3 text-sm text-[#1c1608]"
            >
              前往登录
            </Link>
          </div>
        )}
      </main>
    </SiteShell>
  );
}
