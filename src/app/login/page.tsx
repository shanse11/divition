import Link from "next/link";
import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "登录" };

export default function LoginPage() {
  return (
    <SiteShell>
      <main className="px-4 pt-32 pb-20">
        <h1 className="font-serif-cn text-center text-3xl font-bold text-[#f7f1e7]">
          回到你的星语秘境
        </h1>
        <p className="mt-3 text-center text-sm text-[#b9b4c8]">
          登录后,你的占卜记录会在不同设备间随时相伴。
        </p>
        <div className="mt-8">
          <AuthForm mode="login" />
        </div>
        <p className="mt-6 text-center text-sm text-[#b9b4c8]">
          还没有账号?{" "}
          <Link
            href="/register"
            className="text-[#d7b46a] hover:text-[#f2da9c]"
          >
            创建账号
          </Link>
        </p>
      </main>
    </SiteShell>
  );
}
