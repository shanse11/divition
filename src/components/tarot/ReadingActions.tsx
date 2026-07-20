"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, NotebookPen, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { SharePanel } from "@/components/share/SharePanel";
import { cn } from "@/lib/utils";
import type { PosterReading } from "@/lib/share/poster";

interface ReadingActionsProps {
  reading: PosterReading;
  favorite: boolean;
  note: string;
  defaultShowQuestion?: boolean;
}

/** 结果页操作条:收藏 / 笔记 / 分享 */
export function ReadingActions({
  reading,
  favorite: initialFavorite,
  note: initialNote,
  defaultShowQuestion = false,
}: ReadingActionsProps) {
  const readingId = reading.id;
  const router = useRouter();
  const [favorite, setFavorite] = useState(initialFavorite);
  const [note, setNote] = useState(initialNote);
  const [noteDraft, setNoteDraft] = useState(initialNote);
  const [noteOpen, setNoteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [favoritePending, setFavoritePending] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const toggleFavorite = async () => {
    if (favoritePending) return;
    const next = !favorite;
    setFavoritePending(true);
    setFavorite(next);
    try {
      const res = await fetch(`/api/readings/${readingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorite: next }),
      });
      if (!res.ok) throw new Error("favorite update failed");
      toast.success(next ? "已加入收藏" : "已取消收藏");
      router.refresh();
    } catch {
      setFavorite(!next);
      toast.error("操作失败,请重试");
    } finally {
      setFavoritePending(false);
    }
  };

  const saveNote = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/readings/${readingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteDraft }),
      });
      if (!res.ok) throw new Error("note update failed");
      setNote(noteDraft);
      setNoteOpen(false);
      toast.success("笔记已保存");
      router.refresh();
    } catch {
      toast.error("保存失败,请重试");
    } finally {
      setSaving(false);
    }
  };

  const deleteReading = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/readings/${readingId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("reading delete failed");
      toast.success("记录已删除");
      router.push("/history");
      router.refresh();
    } catch {
      toast.error("删除失败,请重试");
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="outline"
          onClick={toggleFavorite}
          aria-pressed={favorite}
          className={cn(
            "border-[rgba(215,180,106,0.35)] bg-transparent hover:bg-[rgba(215,180,106,0.08)]",
            favorite ? "text-[#d26a6a]" : "text-[#f2da9c]",
          )}
        >
          <Heart className={cn("h-4 w-4", favorite && "fill-current")} />
          {favorite ? "已收藏" : "收藏"}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setNoteDraft(note);
            setNoteOpen(true);
          }}
          className="border-[rgba(215,180,106,0.35)] bg-transparent text-[#f2da9c] hover:bg-[rgba(215,180,106,0.08)]"
        >
          <NotebookPen className="h-4 w-4" />
          {note ? "编辑笔记" : "添加笔记"}
        </Button>
        <Button
          variant="outline"
          onClick={() => setShareOpen(true)}
          className="border-[rgba(215,180,106,0.35)] bg-transparent text-[#f2da9c] hover:bg-[rgba(215,180,106,0.08)]"
        >
          <Share2 className="h-4 w-4" />
          分享
        </Button>
        <Button
          variant="outline"
          onClick={() => setDeleteOpen(true)}
          className="border-red-400/30 bg-transparent text-red-300 hover:bg-red-400/10 hover:text-red-200"
        >
          <Trash2 className="h-4 w-4" />
          删除记录
        </Button>
      </div>

      {note && (
        <div className="glass-card mx-auto mt-6 max-w-lg rounded-xl p-5">
          <p className="text-xs font-medium text-[#d7b46a]">我的笔记</p>
          <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-[#f7f1e7]/90">
            {note}
          </p>
        </div>
      )}

      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent className="border-[rgba(215,180,106,0.2)] bg-[#111323]">
          <DialogHeader>
            <DialogTitle className="font-serif-cn text-[#f7f1e7]">
              写下此刻的想法
            </DialogTitle>
            <DialogDescription className="text-[#b9b4c8]">
              这些文字只有你能看到。
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value.slice(0, 2000))}
            rows={5}
            placeholder="牌面让你想到了什么?"
            className="resize-none border-[rgba(215,180,106,0.25)] bg-[rgba(7,8,18,0.5)] text-[#f7f1e7]"
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setNoteOpen(false)}
              className="text-[#b9b4c8]"
            >
              取消
            </Button>
            <Button
              onClick={saveNote}
              disabled={saving}
              className="bg-[#d7b46a] text-[#1c1608] hover:bg-[#f2da9c]"
            >
              {saving ? "保存中…" : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="border-red-400/20 bg-[#111323]">
          <DialogHeader>
            <DialogTitle className="font-serif-cn text-[#f7f1e7]">
              删除这次占卜记录?
            </DialogTitle>
            <DialogDescription className="text-[#b9b4c8]">
              此操作无法撤销,相关笔记、收藏和分享链接也会一并移除。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={deleteReading}
            >
              {deleting ? "删除中…" : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SharePanel
        reading={reading}
        defaultShowQuestion={defaultShowQuestion}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />
    </>
  );
}
