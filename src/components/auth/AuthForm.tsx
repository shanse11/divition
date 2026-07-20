"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const submit = async (formData: FormData) => {
    setPending(true);
    setError("");
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
        nickname: formData.get("nickname"),
      }),
    });
    const payload = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(payload.error ?? "操作失败");
      return;
    }
    router.push("/history");
    router.refresh();
  };
  return (
    <form
      action={submit}
      className="glass-card mx-auto max-w-md space-y-5 rounded-2xl p-6 sm:p-8"
    >
      {mode === "register" && (
        <div>
          <label htmlFor="nickname" className="text-sm text-[#f2da9c]">
            昵称
          </label>
          <Input
            id="nickname"
            name="nickname"
            required
            maxLength={20}
            className="mt-2 border-[rgba(215,180,106,0.25)] bg-black/20"
          />
        </div>
      )}
      <div>
        <label htmlFor="email" className="text-sm text-[#f2da9c]">
          邮箱
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-2 border-[rgba(215,180,106,0.25)] bg-black/20"
        />
      </div>
      <div>
        <label htmlFor="password" className="text-sm text-[#f2da9c]">
          密码
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={mode === "login" ? 1 : 8}
          className="mt-2 border-[rgba(215,180,106,0.25)] bg-black/20"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-[#d26a6a]">
          {error}
        </p>
      )}
      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-[#d7b46a] text-[#1c1608] hover:bg-[#f2da9c]"
      >
        {pending ? "请稍候…" : mode === "login" ? "登录" : "创建账号"}
      </Button>
    </form>
  );
}
