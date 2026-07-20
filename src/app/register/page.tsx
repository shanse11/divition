import Link from "next/link";
import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "注册" };

export default function RegisterPage() {
  return (
    <SiteShell>
      <main className="px-4 pt-32 pb-20">
        <h1 className="font-serif-cn text-center text-3xl font-bold text-[#f7f1e7]">
          开启你的星语记录
        </h1>
        <p className="mt-3 text-center text-sm text-[#b9b4c8]">
          免费保存占卜、每日牌面与自我觉察笔记。
        </p>
        <div className="mt-8">
          <AuthForm mode="register" />
        </div>
        <p className="mt-6 text-center text-sm text-[#b9b4c8]">
          已有账号?{" "}
          <Link href="/login" className="text-[#d7b46a] hover:text-[#f2da9c]">
            立即登录
          </Link>
        </p>
      </main>
    </SiteShell>
  );
}
