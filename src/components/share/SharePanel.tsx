"use client";

import { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Check, Copy, Download, Link2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TarotCardFace } from "@/components/tarot/TarotCardFace";
import { playSound } from "@/components/audio/MusicController";
import {
  DEFAULT_POSTER_OPTIONS,
  derivePosterContent,
  type PosterOptions,
  type PosterReading,
} from "@/lib/share/poster";

interface SharePanelProps {
  reading: PosterReading;
  defaultShowQuestion?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OPTION_LABELS: Array<[keyof PosterOptions, string]> = [
  ["showQuestion", "显示我的问题（私人内容）"],
  ["showFullCardReadings", "显示每张牌的完整解读"],
  ["showAdvice", "显示行动建议"],
  ["showSpread", "显示牌阵名称"],
  ["showDate", "显示占卜日期"],
  ["showLogo", "显示品牌标识"],
  ["showDisclaimer", "显示免责声明"],
];

async function copyText(text: string) {
  if (navigator.clipboard?.writeText)
    return navigator.clipboard.writeText(text);
  const input = document.createElement("textarea");
  input.value = text;
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.append(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();
  if (!copied) throw new Error("copy failed");
}

async function waitForPosterAssets(node: HTMLElement) {
  await document.fonts?.ready;
  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    images.map((image) =>
      image.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            image.addEventListener("load", () => resolve(), { once: true });
            image.addEventListener("error", () => resolve(), { once: true });
          }),
    ),
  );
}

function dataUrlToFile(dataUrl: string, name: string) {
  const [metadata, data] = dataUrl.split(",");
  if (!metadata || !data) throw new Error("invalid image");
  const mime = metadata.match(/data:(.*?);base64/)?.[1] ?? "image/png";
  const binary = atob(data);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new File([bytes], name, { type: mime });
}

export function SharePanel({
  reading,
  defaultShowQuestion = false,
  open,
  onOpenChange,
}: SharePanelProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [options, setOptions] = useState<PosterOptions>({
    ...DEFAULT_POSTER_OPTIONS,
    showQuestion: Boolean(defaultShowQuestion && reading.question),
  });
  const [shareUrl, setShareUrl] = useState("");
  const [creating, setCreating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const content = useMemo(
    () => derivePosterContent(reading, options),
    [options, reading],
  );

  const createLink = async () => {
    setCreating(true);
    try {
      const response = await fetch(`/api/readings/${reading.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showQuestion: options.showQuestion }),
      });
      const payload = (await response.json()) as {
        url?: string;
        error?: string;
      };
      if (!response.ok || !payload.url) throw new Error(payload.error);
      const url = new URL(payload.url, window.location.origin).toString();
      setShareUrl(url);
      await copyText(url);
      playSound("success");
      toast.success("分享链接已复制");
    } catch {
      toast.error("分享链接生成失败，请稍后重试");
    } finally {
      setCreating(false);
    }
  };

  const copyLink = async () => {
    try {
      await copyText(shareUrl);
      playSound("button");
      toast.success("链接已复制");
    } catch {
      toast.error("复制失败，请手动选择链接");
    }
  };

  const downloadPoster = async () => {
    if (!posterRef.current || exporting) return;
    setExporting(true);
    try {
      await waitForPosterAssets(posterRef.current);
      const dataUrl = await toPng(posterRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#070812",
      });
      const filename = `astral-oracle-${reading.id}.png`;
      const file = dataUrlToFile(dataUrl, filename);
      if (
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) &&
        navigator.share &&
        navigator.canShare?.({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: content.theme,
          text: "我的塔罗指引",
        });
      } else {
        const anchor = document.createElement("a");
        anchor.download = filename;
        anchor.href = dataUrl;
        anchor.style.display = "none";
        document.body.append(anchor);
        anchor.click();
        anchor.remove();
      }
      playSound("success");
      toast.success("分享图已生成");
    } catch (error) {
      if ((error as DOMException)?.name !== "AbortError") {
        toast.error("图片生成失败，请稍后重试或使用截图分享");
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto border-[rgba(215,180,106,0.2)] bg-[#111323] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif-cn text-[#f7f1e7]">
            分享这次星语
          </DialogTitle>
          <DialogDescription className="text-[#b9b4c8]">
            所有私人和详细内容默认关闭。公开链接使用随机标识，任何获得链接的人都可以查看。
          </DialogDescription>
        </DialogHeader>

        <div
          ref={posterRef}
          className="relative mx-auto w-full max-w-[560px] overflow-hidden rounded-2xl border border-[rgba(215,180,106,0.3)] bg-[radial-gradient(circle_at_top,rgba(117,98,168,0.3),transparent_38%),#070812] px-5 py-7 text-center sm:px-8"
        >
          <div className="pointer-events-none absolute inset-3 rounded-xl border border-[rgba(215,180,106,0.12)]" />
          <div className="relative">
            {content.logo && (
              <>
                <Share2 className="mx-auto h-6 w-6 text-[#d7b46a]" />
                <p className="font-display mt-3 text-[10px] tracking-[0.3em] text-[#d7b46a] uppercase">
                  {content.logo}
                </p>
              </>
            )}
            <h3 className="font-serif-cn mt-3 text-2xl leading-tight font-bold text-balance text-[#f7f1e7]">
              {content.theme}
            </h3>
            <div className="mt-2 flex flex-wrap justify-center gap-2 text-[10px] text-[#b9b4c8]">
              {content.spread && <span>{content.spread}</span>}
              {content.date && <time>{content.date}</time>}
            </div>
            {content.question && (
              <p className="mx-auto mt-4 max-w-md text-xs leading-relaxed break-words text-[#b9b4c8] italic">
                「{content.question}」
              </p>
            )}

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {content.cards.map((card) => (
                <article
                  key={`${card.id}-${card.position}`}
                  className="rounded-xl border border-[rgba(215,180,106,0.16)] bg-[#111323]/70 p-3 text-left"
                >
                  <div className="flex gap-3">
                    <div className="w-16 shrink-0">
                      <TarotCardFace
                        name={card.name}
                        nameEn={card.nameEn}
                        label={card.label}
                        seed={card.seed}
                        suit={card.suit}
                        image={card.image}
                        reversed={card.reversed}
                        className="text-[8px]"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-[#d7b46a]">
                        {card.position}
                      </p>
                      <h4 className="font-serif-cn mt-1 text-sm font-bold text-[#f7f1e7]">
                        {card.name} · {card.orientation}
                      </h4>
                      <p className="mt-2 text-[10px] leading-relaxed break-words text-[#b9b4c8]">
                        {card.keywords.join(" · ")}
                      </p>
                    </div>
                  </div>
                  {card.interpretation && (
                    <p className="mt-3 text-[11px] leading-relaxed break-words text-[#f7f1e7]/85">
                      {card.interpretation}
                    </p>
                  )}
                </article>
              ))}
            </div>

            <blockquote className="font-serif-cn mt-6 text-sm leading-relaxed break-words text-[#f2da9c]">
              {content.summary}
            </blockquote>
            {content.advice.length > 0 && (
              <section className="mt-5 rounded-xl bg-black/15 p-4 text-left">
                <h4 className="text-xs font-medium text-[#d7b46a]">行动建议</h4>
                <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-[#f7f1e7]/85">
                  {content.advice.map((advice) => (
                    <li key={advice} className="break-words">
                      · {advice}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {shareUrl && (
              <p className="mt-5 text-[9px] break-all text-[#d7b46a]/80">
                查看分享：{shareUrl}
              </p>
            )}
            {content.disclaimer && (
              <p className="mt-5 text-[9px] leading-relaxed break-words text-[#b9b4c8]/60">
                {content.disclaimer}
              </p>
            )}
          </div>
        </div>

        <fieldset className="grid gap-2 rounded-xl border border-[rgba(215,180,106,0.16)] p-3 sm:grid-cols-2">
          <legend className="px-1 text-xs text-[#d7b46a]">海报内容</legend>
          {OPTION_LABELS.map(([key, label]) => {
            const disabled = key === "showQuestion" && !reading.question;
            return (
              <label
                key={key}
                className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-[#b9b4c8] has-disabled:cursor-not-allowed has-disabled:opacity-50"
              >
                <Checkbox
                  checked={options[key]}
                  disabled={disabled}
                  onCheckedChange={(checked) =>
                    setOptions((current) => ({
                      ...current,
                      [key]: checked === true,
                    }))
                  }
                  aria-label={label}
                />
                <span>{label}</span>
              </label>
            );
          })}
        </fieldset>

        {shareUrl && (
          <div className="flex items-center gap-2 rounded-lg bg-[rgba(7,8,18,0.55)] p-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-400" />
            <span className="min-w-0 flex-1 truncate text-xs text-[#b9b4c8]">
              {shareUrl}
            </span>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={copyLink}
              aria-label="复制分享链接"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            onClick={createLink}
            disabled={creating}
            className="bg-[#d7b46a] text-[#1c1608] hover:bg-[#f2da9c]"
          >
            <Link2 className="h-4 w-4" />
            {creating ? "生成中…" : "生成并复制链接"}
          </Button>
          <Button
            variant="outline"
            onClick={downloadPoster}
            disabled={exporting}
            className="border-[rgba(215,180,106,0.35)] text-[#f2da9c]"
          >
            <Download className="h-4 w-4" />
            {exporting ? "生成中…" : "下载分享图"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
