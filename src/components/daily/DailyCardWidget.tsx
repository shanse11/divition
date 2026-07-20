"use client";

import { useEffect, useState } from "react";
import { CalendarDays, LoaderCircle, Sparkles } from "lucide-react";
import {
  buildMonthCheckInCalendar,
  type CheckInStats,
  type AchievementDefinition,
} from "@/lib/daily";
import { getCardById } from "@/data/tarot-cards";
import { TarotCardFace } from "@/components/tarot/TarotCardFace";

interface DailyPayload {
  date: string;
  cardId: string;
  reversed: boolean;
  content: {
    keywords: string[];
    love: string;
    career: string;
    wealth: string;
    emotion: string;
    advice: string;
    luckyColor: string;
    luckyNumber: number;
    do: string[];
    avoid: string[];
  };
  stats: CheckInStats;
  achievements: Array<AchievementDefinition & { unlocked: boolean }>;
  checkInDates: string[];
}

export function DailyCardWidget() {
  const [daily, setDaily] = useState<DailyPayload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/daily")
      .then(async (response) => {
        if (!response.ok) throw new Error("daily request failed");
        return (await response.json()) as DailyPayload;
      })
      .then(setDaily)
      .catch(() => setError("今日牌面暂时被薄雾遮住了,请稍后刷新。"));
  }, []);

  if (error)
    return (
      <p className="glass-card rounded-2xl p-8 text-center text-[#d26a6a]">
        {error}
      </p>
    );
  if (!daily) {
    return (
      <div
        className="glass-card flex min-h-64 items-center justify-center rounded-2xl text-[#b9b4c8]"
        role="status"
      >
        <LoaderCircle className="mr-2 h-5 w-5 animate-spin text-[#d7b46a]" />{" "}
        正在连接今日星象
      </div>
    );
  }

  const card = getCardById(daily.cardId);
  if (!card) return null;

  const calendar = buildMonthCheckInCalendar(
    Number(daily.date.slice(0, 4)),
    Number(daily.date.slice(5, 7)),
    daily.checkInDates,
    daily.date,
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["连续签到", `${daily.stats.currentStreak} 天`],
          ["累计签到", `${daily.stats.totalDays} 天`],
          ["最长连续", `${daily.stats.longestStreak} 天`],
        ].map(([label, value]) => (
          <section
            key={label}
            className="glass-card rounded-2xl p-5 text-center"
          >
            <p className="text-xs text-[#b9b4c8]">{label}</p>
            <p className="font-display mt-2 text-2xl text-[#f2da9c]">{value}</p>
          </section>
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <section className="glass-card rounded-2xl p-6 text-center">
          <p className="flex items-center justify-center gap-2 text-xs text-[#d7b46a]">
            <CalendarDays className="h-4 w-4" /> {daily.date}
          </p>
          <div className="mx-auto mt-5 w-36">
            <TarotCardFace
              name={card.name}
              nameEn={card.nameEn}
              label={card.label}
              seed={card.index + 1}
              suit={card.suit}
              image={card.image}
              reversed={daily.reversed}
            />
          </div>
          <h2 className="font-serif-cn mt-4 text-xl font-bold text-[#f7f1e7]">
            {card.name} · {daily.reversed ? "逆位" : "正位"}
          </h2>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {daily.content.keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full bg-[rgba(215,180,106,0.1)] px-3 py-1 text-xs text-[#d7b46a]"
              >
                {keyword}
              </span>
            ))}
          </div>
        </section>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["感情运势", daily.content.love],
            ["事业学业", daily.content.career],
            ["财务提醒", daily.content.wealth],
            ["情绪状态", daily.content.emotion],
          ].map(([title, text]) => (
            <section key={title} className="glass-card rounded-2xl p-5">
              <h3 className="font-serif-cn text-base font-bold text-[#f2da9c]">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#b9b4c8]">
                {text}
              </p>
            </section>
          ))}
          <section className="glass-card rounded-2xl p-5 sm:col-span-2">
            <h3 className="font-serif-cn flex items-center gap-2 text-base font-bold text-[#f2da9c]">
              <Sparkles className="h-4 w-4" />
              今日建议
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#f7f1e7]/90">
              {daily.content.advice}
            </p>
            <p className="mt-4 text-xs text-[#b9b4c8]">
              幸运色: {daily.content.luckyColor} · 幸运数字:{" "}
              {daily.content.luckyNumber}
            </p>
          </section>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="glass-card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif-cn font-bold text-[#f2da9c]">本月星轨</h3>
            <span className="text-xs text-[#b9b4c8]">金色日期已完成签到</span>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            <>
              {["一", "二", "三", "四", "五", "六", "日"].map((day) => (
                <span key={day} className="py-1 text-[#756f83]">
                  {day}
                </span>
              ))}
            </>
            {calendar.map((day) => (
              <span
                key={day.date}
                title={day.date}
                className={`rounded-lg py-2 ${day.checkedIn ? "bg-[#d7b46a] font-bold text-[#1c1608]" : day.inMonth ? "bg-white/5 text-[#b9b4c8]" : "text-[#514d5d]"} ${day.isFuture ? "opacity-40" : ""}`}
              >
                {day.day}
              </span>
            ))}
          </div>
        </section>
        <section className="glass-card rounded-2xl p-5">
          <h3 className="font-serif-cn font-bold text-[#f2da9c]">星光成就</h3>
          <div className="mt-4 space-y-3">
            {daily.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`rounded-xl border p-4 ${achievement.unlocked ? "border-[#d7b46a]/40 bg-[#d7b46a]/10" : "border-white/10 opacity-55"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-[#f7f1e7]">
                    {achievement.name}
                  </p>
                  <span className="text-xs text-[#d7b46a]">
                    {achievement.unlocked
                      ? "已解锁"
                      : `${achievement.threshold} 天`}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#b9b4c8]">
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-[#756f83]">
            匿名旅人也可查看已达成成就；登录后成就会与账号记录关联。
          </p>
        </section>
      </div>
    </div>
  );
}
