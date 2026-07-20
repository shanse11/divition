"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SessionUser } from "@/server/auth";

export function ProfileForm({ profile }: { profile: SessionUser }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function submit(formData: FormData) {
    setPending(true);
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nickname: formData.get("nickname"),
        bio: formData.get("bio"),
        birthDate: formData.get("birthDate") || null,
        avatarSeed: formData.get("avatarSeed"),
      }),
    });
    const payload = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      toast.error(payload.error ?? "保存失败");
      return;
    }
    toast.success("个人资料已保存");
    router.refresh();
  }
  return (
    <form
      action={submit}
      className="glass-card mt-8 space-y-5 rounded-2xl p-6 sm:p-8"
    >
      <div>
        <label htmlFor="nickname" className="text-sm text-[#f2da9c]">
          昵称
        </label>
        <Input
          id="nickname"
          name="nickname"
          defaultValue={profile.nickname}
          maxLength={20}
          required
          className="mt-2 bg-black/20"
        />
      </div>
      <div>
        <label htmlFor="bio" className="text-sm text-[#f2da9c]">
          个人简介
        </label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={profile.bio}
          maxLength={200}
          rows={4}
          className="mt-2 bg-black/20"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="birthDate" className="text-sm text-[#f2da9c]">
            出生日期
          </label>
          <Input
            id="birthDate"
            name="birthDate"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            defaultValue={profile.birthDate ?? ""}
            className="mt-2 bg-black/20"
          />
        </div>
        <div>
          <label htmlFor="avatarSeed" className="text-sm text-[#f2da9c]">
            头像种子
          </label>
          <Input
            id="avatarSeed"
            name="avatarSeed"
            defaultValue={profile.avatarSeed}
            maxLength={30}
            required
            className="mt-2 bg-black/20"
          />
          <p className="mt-1 text-xs text-[#8f8a9d]">
            用于稳定生成你的个性头像。
          </p>
        </div>
      </div>
      <p className="text-sm text-[#b9b4c8]">
        登录邮箱：{profile.email}（暂不支持修改）
      </p>
      <Button type="submit" disabled={pending}>
        {pending ? "保存中…" : "保存资料"}
      </Button>
    </form>
  );
}
