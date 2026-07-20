import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/layout/SiteShell";
import { ProfileForm } from "@/components/account/ProfileForm";
import { getCurrentUser } from "@/server/auth";

export const metadata: Metadata = { title: "个人中心" };
export default async function ProfilePage() {
  const user = await getCurrentUser();
  return (
    <SiteShell>
      <main className="mx-auto max-w-3xl px-4 pt-28 pb-20 sm:px-6">
        <h1 className="font-serif-cn text-3xl font-bold text-[#f7f1e7]">
          个人中心
        </h1>
        <p className="mt-2 text-sm text-[#b9b4c8]">
          管理你的公开称呼与个人资料。
        </p>
        {user ? (
          <ProfileForm profile={user} />
        ) : (
          <div className="glass-card mt-8 rounded-2xl p-8 text-center">
            <p className="text-[#b9b4c8]">登录后可以同步并修改个人资料。</p>
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
