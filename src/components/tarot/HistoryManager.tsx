"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Grid2X2, Heart, List, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { OwnedReading } from "@/server/repo/readings";

interface HistoryManagerProps {
  initialReadings: OwnedReading[];
  initialNextCursor: string | null;
}

type View = "cards" | "timeline";
type BulkAction = "delete" | "favorite" | "unfavorite" | "export";

interface ReadingsResponse {
  readings: OwnedReading[];
  nextCursor: string | null;
}

function downloadJson(readings: OwnedReading[]) {
  const blob = new Blob([JSON.stringify(readings, null, 2)], {
    type: "application/json",
  });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = `tarot-history-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(href);
}

export function HistoryManager({
  initialReadings,
  initialNextCursor,
}: HistoryManagerProps) {
  const [readings, setReadings] = useState(initialReadings);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [view, setView] = useState<View>("cards");
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("all");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const initialRender = useRef(true);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({ limit: "20" });
    if (q.trim()) params.set("q", q.trim());
    if (kind !== "all") params.set("kind", kind);
    if (favoriteOnly) params.set("favorite", "true");
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return params.toString();
  }, [favoriteOnly, from, kind, q, to]);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/readings?${queryString}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("history fetch failed");
        const data = (await response.json()) as ReadingsResponse;
        setReadings(data.readings);
        setNextCursor(data.nextCursor);
        setSelected(new Set());
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          toast.error("筛选记录失败,请重试");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [queryString]);

  const selectedIds = [...selected];
  const setAll = (checked: boolean) =>
    setSelected(checked ? new Set(readings.map((item) => item.id)) : new Set());
  const toggle = (id: string, checked: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });

  const loadMore = async () => {
    if (!nextCursor || loading) return;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/readings?${queryString}&cursor=${encodeURIComponent(nextCursor)}`,
      );
      if (!response.ok) throw new Error("history fetch failed");
      const data = (await response.json()) as ReadingsResponse;
      setReadings((current) => [...current, ...data.readings]);
      setNextCursor(data.nextCursor);
    } catch {
      toast.error("加载更多失败,请重试");
    } finally {
      setLoading(false);
    }
  };

  const execute = async (action: BulkAction) => {
    if (!selectedIds.length || pending) return;
    setPending(true);
    try {
      const response = await fetch("/api/readings/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: selectedIds }),
      });
      if (!response.ok) throw new Error("bulk failed");
      if (action === "export") {
        const data = (await response.json()) as { readings: OwnedReading[] };
        downloadJson(data.readings);
      } else if (action === "delete") {
        setReadings((items) => items.filter((item) => !selected.has(item.id)));
      } else {
        setReadings((items) =>
          items.map((item) =>
            selected.has(item.id)
              ? { ...item, favorite: action === "favorite" }
              : item,
          ),
        );
      }
      setSelected(new Set());
      setConfirmAction(null);
      toast.success(
        action === "delete"
          ? "记录已删除"
          : action === "export"
            ? "导出已开始"
            : "收藏状态已更新",
      );
    } catch {
      toast.error("操作失败,请重试");
    } finally {
      setPending(false);
    }
  };

  const actionLabel =
    confirmAction === "delete"
      ? "永久删除"
      : confirmAction === "favorite"
        ? "收藏"
        : confirmAction === "unfavorite"
          ? "取消收藏"
          : "导出";

  return (
    <>
      <section
        className="glass-card mb-6 rounded-2xl p-4 sm:p-5"
        aria-label="历史记录筛选"
      >
        <div className="grid gap-3 md:grid-cols-[minmax(12rem,1fr)_auto_auto]">
          <label className="relative">
            <span className="sr-only">搜索记录</span>
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#8e89a3]" />
            <Input
              value={q}
              onChange={(event) => setQ(event.target.value.slice(0, 200))}
              placeholder="搜索问题、解读或笔记"
              className="border-white/10 bg-black/20 pl-9 text-[#f7f1e7]"
            />
          </label>
          <select
            aria-label="占卜类型"
            value={kind}
            onChange={(event) => setKind(event.target.value)}
            className="h-9 rounded-md border border-white/10 bg-[#111323] px-3 text-sm text-[#f7f1e7]"
          >
            <option value="all">全部类型</option>
            <option value="tarot">塔罗占卜</option>
            <option value="relationship">关系占卜</option>
          </select>
          <label className="flex h-9 items-center gap-2 rounded-md border border-white/10 px-3 text-sm text-[#d8d3e2]">
            <Checkbox
              checked={favoriteOnly}
              onCheckedChange={(value) => setFavoriteOnly(value === true)}
            />
            仅看收藏
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Input
            aria-label="开始日期"
            type="date"
            value={from}
            max={to || undefined}
            onChange={(event) => setFrom(event.target.value)}
            className="w-auto border-white/10 bg-black/20 text-[#d8d3e2]"
          />
          <span className="text-sm text-[#8e89a3]">至</span>
          <Input
            aria-label="结束日期"
            type="date"
            value={to}
            min={from || undefined}
            onChange={(event) => setTo(event.target.value)}
            className="w-auto border-white/10 bg-black/20 text-[#d8d3e2]"
          />
          <div className="ml-auto flex rounded-lg border border-white/10 p-1">
            <Button
              size="icon-sm"
              variant={view === "cards" ? "secondary" : "ghost"}
              onClick={() => setView("cards")}
              aria-label="卡片视图"
            >
              <Grid2X2 />
            </Button>
            <Button
              size="icon-sm"
              variant={view === "timeline" ? "secondary" : "ghost"}
              onClick={() => setView("timeline")}
              aria-label="时间线视图"
            >
              <List />
            </Button>
          </div>
        </div>
      </section>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="mr-2 flex items-center gap-2 text-sm text-[#b9b4c8]">
          <Checkbox
            checked={
              readings.length > 0 &&
              readings.every((item) => selected.has(item.id))
            }
            onCheckedChange={(value) => setAll(value === true)}
          />
          选择当前 {readings.length} 条
        </label>
        {selected.size > 0 && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirmAction("favorite")}
            >
              <Heart />
              收藏
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirmAction("unfavorite")}
            >
              取消收藏
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirmAction("export")}
            >
              <Download />
              导出
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setConfirmAction("delete")}
            >
              <Trash2 />
              删除
            </Button>
          </>
        )}
      </div>

      {loading && readings.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-[#b9b4c8]">
          正在读取星语…
        </div>
      ) : readings.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="font-serif-cn text-xl text-[#f2da9c]">
            没有找到相符的记录
          </p>
          <p className="mt-2 text-sm text-[#b9b4c8]">
            调整筛选条件,或开始一次新的占卜。
          </p>
        </div>
      ) : (
        <>
          <div
            className={
              view === "cards"
                ? "grid gap-4 sm:grid-cols-2"
                : "relative space-y-4 border-l border-[#d7b46a]/20 pl-6"
            }
          >
            {readings.map((reading) => (
              <Card
                key={reading.id}
                className={`glass-card border-white/5 bg-transparent ${view === "timeline" ? "relative before:absolute before:top-6 before:-left-[1.82rem] before:h-3 before:w-3 before:rounded-full before:bg-[#d7b46a]" : ""}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selected.has(reading.id)}
                      onCheckedChange={(value) =>
                        toggle(reading.id, value === true)
                      }
                      aria-label={`选择 ${reading.interpretation?.theme ?? "占卜记录"}`}
                    />
                    <Link
                      href={`/tarot/result/${reading.id}`}
                      className="min-w-0 flex-1"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-[#d7b46a]">
                            {new Date(reading.createdAt).toLocaleDateString(
                              "zh-CN",
                            )}{" "}
                            ·{" "}
                            {reading.kind === "relationship"
                              ? "关系占卜"
                              : "塔罗占卜"}
                          </p>
                          <h2 className="font-serif-cn mt-2 text-lg font-bold text-[#f7f1e7]">
                            {reading.interpretation?.theme ?? "一次星语占卜"}
                          </h2>
                        </div>
                        {reading.favorite && (
                          <Heart className="h-4 w-4 fill-current text-[#d26a6a]" />
                        )}
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm text-[#b9b4c8]">
                        {reading.question || "今日指引"}
                      </p>
                      <p className="mt-4 text-xs text-[#d7b46a]">
                        共 {reading.cards.length} 张牌
                        {reading.note ? " · 有笔记" : ""}
                      </p>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {nextCursor && (
            <div className="mt-6 text-center">
              <Button variant="outline" disabled={loading} onClick={loadMore}>
                {loading ? "加载中…" : "加载更多"}
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <DialogContent className="border-[#d7b46a]/20 bg-[#111323]">
          <DialogHeader>
            <DialogTitle className="font-serif-cn text-[#f7f1e7]">
              确认{actionLabel} {selected.size} 条记录?
            </DialogTitle>
            <DialogDescription className="text-[#b9b4c8]">
              {confirmAction === "delete"
                ? "删除后无法恢复,相关笔记、收藏和分享链接也会一并移除。"
                : confirmAction === "export"
                  ? "将下载仅包含所选记录的 JSON 文件,请妥善保存。"
                  : "此操作只会影响你选择的记录。"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmAction(null)}>
              取消
            </Button>
            <Button
              variant={confirmAction === "delete" ? "destructive" : "default"}
              disabled={pending}
              onClick={() => confirmAction && execute(confirmAction)}
            >
              {pending ? "处理中…" : `确认${actionLabel}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
