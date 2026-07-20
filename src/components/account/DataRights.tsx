"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CONFIRMATION = "删除我的账号";
export function DataRights() {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  async function remove() {
    setPending(true);
    const response = await fetch("/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmation }),
    });
    const payload = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) return toast.error(payload.error ?? "删除失败");
    router.push("/");
    router.refresh();
  }
  return (
    <section className="glass-card mt-8 rounded-2xl p-6 sm:p-8">
      <h2 className="font-serif-cn text-xl font-bold text-[#f2da9c]">
        账号与数据权利
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[#b9b4c8]">
        你可以随时下载账号数据、退出登录，或永久删除账号。
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <a href="/api/account/export" download>
            下载我的数据
          </a>
        </Button>
        <Button variant="outline" onClick={logout}>
          退出登录
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive">删除账号</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>永久删除账号</DialogTitle>
              <DialogDescription>
                这将永久删除个人资料、偏好、占卜记录、抽牌、解读、笔记、收藏、每日记录、梦境、成就与分享链接，无法恢复。
              </DialogDescription>
            </DialogHeader>
            <div>
              <label htmlFor="delete-confirmation" className="text-sm">
                请输入“{CONFIRMATION}”确认
              </label>
              <Input
                id="delete-confirmation"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                autoComplete="off"
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">取消</Button>
              </DialogClose>
              <Button
                variant="destructive"
                disabled={confirmation !== CONFIRMATION || pending}
                onClick={remove}
              >
                {pending ? "删除中…" : "永久删除"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
