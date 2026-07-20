"use client";

import { useState } from "react";
import { LoaderCircle, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { DreamInterpretation } from "@/lib/ai/schema";

const fields = [
  ["when", "大约何时做的梦", "例如：昨晚、童年时", 50],
  ["emotion", "醒来时的情绪", "例如：紧张、释然", 50],
  ["people", "梦里的人物", "出现了谁？", 100],
  ["objects", "重要的物件", "例如：钥匙、镜子", 100],
  ["scene", "梦里的场景", "例如：海边的旧屋", 100],
  ["feeling", "身体或内在感受", "醒来后还留下什么感受？", 100],
] as const;

export function DreamForm() {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string | boolean>>({
    content: "",
    recurring: false,
    title: "",
    note: "",
  });
  const [result, setResult] = useState<DreamInterpretation | null>(null);
  const [loading, setLoading] = useState(false);
  const set = (key: string, value: string | boolean) =>
    setValues((current) => ({ ...current, [key]: value }));
  const submit = async () => {
    if (String(values.content).trim().length < 10) return;
    setLoading(true);
    try {
      const response = await fetch("/api/dream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = (await response.json()) as {
        id?: string;
        result?: DreamInterpretation;
        error?: string;
      };
      if (!response.ok || !payload.result)
        throw new Error(payload.error ?? "dream failed");
      setResult(payload.result);
      if (payload.id) router.push(`/dream/${payload.id}`);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <form
        className="glass-card rounded-2xl p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <label
          className="font-serif-cn text-base font-bold text-[#f2da9c]"
          htmlFor="dream-content"
        >
          梦境内容
        </label>
        <Textarea
          id="dream-content"
          required
          value={String(values.content)}
          onChange={(event) =>
            set("content", event.target.value.slice(0, 2000))
          }
          rows={7}
          placeholder="记下仍留在你心里的画面……"
          className="mt-3 resize-none border-[rgba(215,180,106,0.25)] bg-[rgba(7,8,18,0.5)] text-[#f7f1e7]"
        />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {fields.map(([key, label, placeholder, max]) => (
            <div key={key}>
              <label
                className="text-sm text-[#f2da9c]"
                htmlFor={`dream-${key}`}
              >
                {label}
              </label>
              <Input
                id={`dream-${key}`}
                value={String(values[key] ?? "")}
                maxLength={max}
                onChange={(event) => set(key, event.target.value)}
                placeholder={placeholder}
                className="mt-2 border-[rgba(215,180,106,0.25)] bg-[rgba(7,8,18,0.5)] text-[#f7f1e7]"
              />
            </div>
          ))}
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-[#b9b4c8]">
          <input
            type="checkbox"
            checked={Boolean(values.recurring)}
            onChange={(event) => set("recurring", event.target.checked)}
          />
          这是反复出现的梦
        </label>
        <Input
          value={String(values.title)}
          maxLength={100}
          onChange={(event) => set("title", event.target.value)}
          placeholder="标题（可选）"
          className="mt-4 border-[rgba(215,180,106,0.25)] bg-[rgba(7,8,18,0.5)] text-[#f7f1e7]"
        />
        <Textarea
          value={String(values.note)}
          maxLength={1000}
          onChange={(event) => set("note", event.target.value)}
          rows={3}
          placeholder="给未来自己的备注（可选）"
          className="mt-3 resize-none border-[rgba(215,180,106,0.25)] bg-[rgba(7,8,18,0.5)] text-[#f7f1e7]"
        />
        <Button
          type="submit"
          disabled={loading || String(values.content).trim().length < 10}
          className="mt-6 w-full bg-[#d7b46a] text-[#1c1608] hover:bg-[#f2da9c]"
        >
          {loading ? (
            <>
              <LoaderCircle className="animate-spin" />
              正在倾听梦境
            </>
          ) : (
            <>
              <Moon />
              开始解梦
            </>
          )}
        </Button>
        <p className="mt-4 text-xs leading-relaxed text-[#b9b4c8]/70">
          解梦是自我反思的工具,不是医学或心理诊断。
        </p>
      </form>
      <section className="glass-card rounded-2xl p-6 sm:p-8">
        {!result ? (
          <div className="flex min-h-80 items-center justify-center text-center text-sm text-[#b9b4c8]">
            写下梦境,让潜意识有机会被温柔地看见。
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="font-serif-cn text-2xl font-bold text-[#f7f1e7]">
              {result.theme}
            </h2>
            <p className="text-sm leading-relaxed text-[#b9b4c8]">
              {result.psychologicalMapping}
            </p>
            <p className="text-xs text-[#b9b4c8]/70">
              {result.uncertaintyNote}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
