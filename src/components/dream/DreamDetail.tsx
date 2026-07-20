"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { DreamRecord } from "@/lib/dream-record";

export function DreamDetail({ dream }: { dream: DreamRecord }) {
  const router = useRouter();
  const [title, setTitle] = useState(dream.title);
  const [note, setNote] = useState(dream.note);
  const [favorite, setFavorite] = useState(dream.favorite);
  const [pending, setPending] = useState(false);
  const save = async () => {
    setPending(true);
    try {
      const response = await fetch(`/api/dream/${dream.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, note, favorite }),
      });
      if (!response.ok) throw new Error();
      router.refresh();
    } finally {
      setPending(false);
    }
  };
  const remove = async () => {
    if (!window.confirm("确定删除这条梦境记录吗？")) return;
    setPending(true);
    const response = await fetch(`/api/dream/${dream.id}`, {
      method: "DELETE",
    });
    if (response.ok) router.push("/dream/history");
    else setPending(false);
  };
  return (
    <div className="space-y-6">
      <section className="glass-card rounded-2xl p-6 sm:p-8">
        <p className="text-xs text-[#b9b4c8]">
          {new Date(dream.createdAt).toLocaleString("zh-CN")}
        </p>
        <h1 className="font-serif-cn mt-3 text-3xl font-bold text-[#f7f1e7]">
          {dream.title || dream.result.theme}
        </h1>
        <p className="mt-5 text-sm leading-7 whitespace-pre-wrap text-[#b9b4c8]">
          {dream.input.content}
        </p>
        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          {[
            ["时间", dream.input.when],
            ["情绪", dream.input.emotion],
            ["人物", dream.input.people],
            ["物件", dream.input.objects],
            ["场景", dream.input.scene],
            ["感受", dream.input.feeling],
          ]
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label}>
                <dt className="text-[#d7b46a]">{label}</dt>
                <dd className="mt-1 text-[#b9b4c8]">{value}</dd>
              </div>
            ))}
        </dl>
        {dream.input.recurring && (
          <p className="mt-4 text-xs text-[#d7b46a]">反复出现的梦</p>
        )}
      </section>
      <section className="glass-card space-y-5 rounded-2xl p-6 sm:p-8">
        <h2 className="font-serif-cn text-2xl font-bold text-[#f7f1e7]">
          {dream.result.theme}
        </h2>
        <div>
          {dream.result.keyImages.map((item) => (
            <p
              key={item.image}
              className="mb-3 text-sm leading-7 text-[#b9b4c8]"
            >
              <strong className="text-[#d7b46a]">{item.image}</strong> ·{" "}
              {item.meaning}
            </p>
          ))}
        </div>
        <p className="text-sm leading-7 text-[#b9b4c8]">
          {dream.result.psychologicalMapping}
        </p>
        <p className="text-sm leading-7 text-[#b9b4c8]">
          {dream.result.emotionalState}
        </p>
        <p className="text-sm leading-7 text-[#b9b4c8]">
          {dream.result.lifeConnection}
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm text-[#b9b4c8]">
          {dream.result.selfInquiry.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="text-sm leading-7 text-[#b9b4c8]">
          {dream.result.gentleAdvice}
        </p>
        <p className="text-xs text-[#b9b4c8]/70">
          {dream.result.uncertaintyNote}
        </p>
      </section>
      <section className="glass-card space-y-4 rounded-2xl p-6">
        <Input
          value={title}
          maxLength={100}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="记录标题"
        />
        <Textarea
          value={note}
          maxLength={1000}
          onChange={(event) => setNote(event.target.value)}
          rows={4}
          placeholder="写给未来自己的备注"
        />
        <label className="flex items-center gap-2 text-sm text-[#b9b4c8]">
          <input
            type="checkbox"
            checked={favorite}
            onChange={(event) => setFavorite(event.target.checked)}
          />
          收藏这条记录
        </label>
        <div className="flex gap-3">
          <Button disabled={pending} onClick={() => void save()}>
            保存修改
          </Button>
          <Button
            disabled={pending}
            variant="destructive"
            onClick={() => void remove()}
          >
            删除记录
          </Button>
        </div>
      </section>
    </div>
  );
}
