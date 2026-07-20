"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  applyPreferences,
  type StoredPreferences,
} from "@/components/preferences/PreferenceApplicator";

type Settings = StoredPreferences & {
  defaultStyle: string;
  shareShowQuestion: boolean;
};
const styles = [
  { value: "gentle", label: "温柔疗愈" },
  { value: "rational", label: "理性清晰" },
  { value: "poetic", label: "诗意神秘" },
  { value: "direct", label: "直白坦率" },
  { value: "brief", label: "简洁明快" },
  { value: "deep", label: "深入细致" },
];

export function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [value, setValue] = useState(settings);
  const [pending, setPending] = useState(false);
  function patch(next: Partial<Settings>) {
    setValue((current) => ({ ...current, ...next }));
  }
  async function save() {
    setPending(true);
    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });
    const payload = (await response.json()) as {
      error?: string;
      settings?: Settings;
    };
    setPending(false);
    if (!response.ok) return toast.error(payload.error ?? "保存失败");
    if (payload.settings) {
      setValue(payload.settings);
      applyPreferences(payload.settings);
    }
    toast.success("设置已保存");
    router.refresh();
  }
  return (
    <div className="glass-card mt-8 space-y-8 rounded-2xl p-6 sm:p-8">
      <section>
        <h2 className="font-serif-cn text-lg font-bold text-[#f2da9c]">
          解读风格
        </h2>
        <select
          value={value.defaultStyle}
          onChange={(event) => patch({ defaultStyle: event.target.value })}
          className="mt-3 w-full rounded-lg border border-[rgba(215,180,106,0.25)] bg-[#111323] px-3 py-2 text-sm text-[#f7f1e7]"
        >
          {styles.map((style) => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </select>
      </section>
      <section>
        <h2 className="font-serif-cn text-lg font-bold text-[#f2da9c]">
          动画与声音
        </h2>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#f7f1e7]">减少动画</p>
            <p className="mt-1 text-xs text-[#8f8a9d]">立即应用到全站动效。</p>
          </div>
          <Switch
            checked={value.motionLevel === "reduced"}
            onCheckedChange={(checked) =>
              patch({ motionLevel: checked ? "reduced" : "full" })
            }
            aria-label="减少动画"
          />
        </div>
        <div className="mt-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#f7f1e7]">背景音乐</p>
            <p className="mt-1 text-xs text-[#8f8a9d]">
              使用浏览器实时合成的原创星空音色，不加载外部音频素材。
            </p>
          </div>
          <Switch
            checked={value.musicEnabled}
            onCheckedChange={(checked) => patch({ musicEnabled: checked })}
            aria-label="背景音乐"
          />
        </div>
        <label
          htmlFor="musicVolume"
          className="mt-5 block text-sm text-[#f7f1e7]"
        >
          音乐音量：{value.musicVolume}%
        </label>
        <Input
          id="musicVolume"
          type="range"
          min={0}
          max={100}
          value={value.musicVolume}
          onChange={(event) =>
            patch({ musicVolume: Number(event.target.value) })
          }
          className="mt-3 accent-[#d7b46a]"
        />
      </section>
      <section>
        <h2 className="font-serif-cn text-lg font-bold text-[#f2da9c]">
          分享隐私
        </h2>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#f7f1e7]">分享时默认显示问题</p>
            <p className="mt-1 text-xs text-[#8f8a9d]">
              每次分享仍可单独调整。
            </p>
          </div>
          <Switch
            checked={value.shareShowQuestion}
            onCheckedChange={(checked) => patch({ shareShowQuestion: checked })}
            aria-label="分享时默认显示问题"
          />
        </div>
      </section>
      <Button onClick={save} disabled={pending}>
        {pending ? "保存中…" : "保存设置"}
      </Button>
    </div>
  );
}
