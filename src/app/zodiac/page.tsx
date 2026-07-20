import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { BirthDateSelector } from "@/components/zodiac/BirthDateSelector";
import {
  getStableZodiacForecast,
  getZodiacById,
  normalizeForecastPeriod,
  zodiacSigns,
  type ForecastPeriod,
} from "@/data/zodiac";

export const metadata: Metadata = { title: "十二星座运势" };
type SearchParams = Promise<{
  sign?: string | string[];
  birthDate?: string | string[];
  period?: string | string[];
}>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ZodiacPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = await searchParams;
  const selected =
    getZodiacById(first(query.sign) ?? "aries") ?? zodiacSigns[0];
  const period = normalizeForecastPeriod(first(query.period));
  const forecast = getStableZodiacForecast(
    selected.id,
    period,
    new Date().toISOString().slice(0, 10),
  );
  return (
    <SiteShell>
      <main className="mx-auto max-w-6xl px-4 pt-28 pb-20 sm:px-6">
        <header className="mb-10 text-center">
          <p className="font-display text-xs tracking-[0.3em] text-[#d7b46a] uppercase">
            Zodiac Almanac
          </p>
          <h1 className="font-serif-cn mt-3 text-3xl font-bold text-[#f7f1e7] sm:text-4xl">
            十二星座 · 星象预报
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#b9b4c8]">
            选择出生日期，查看稳定生成的今日、本周与本月主题。内容仅作自我觉察参考。
          </p>
          <BirthDateSelector initialDate={first(query.birthDate)} />
        </header>
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="glass-card h-fit rounded-2xl p-5">
            <h2 className="font-serif-cn mb-4 font-bold text-[#f2da9c]">
              选择星座
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {zodiacSigns.map((sign) => (
                <a
                  key={sign.id}
                  href={`/zodiac?sign=${sign.id}&period=${period}`}
                  className={`rounded-xl p-3 text-left transition ${sign.id === selected.id ? "bg-[#d7b46a]/15 text-[#f2da9c]" : "text-[#b9b4c8] hover:bg-white/5"}`}
                >
                  <span className="mr-2 text-lg text-[#d7b46a]">
                    {sign.symbol}
                  </span>
                  <span className="text-sm">{sign.name}</span>
                  <span className="mt-1 block text-[10px] text-[#756f83]">
                    {sign.dateLabel}
                  </span>
                </a>
              ))}
            </div>
          </aside>
          <section className="space-y-5">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-4xl text-[#d7b46a]">{selected.symbol}</p>
                  <h2 className="font-serif-cn mt-2 text-2xl font-bold text-[#f7f1e7]">
                    {selected.name}{" "}
                    <span className="font-display text-sm font-normal text-[#b9b4c8]">
                      {selected.nameEn}
                    </span>
                  </h2>
                  <p className="mt-1 text-sm text-[#b9b4c8]">
                    {selected.dateLabel} · {selected.element}象 ·{" "}
                    {forecast.headline}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-4xl text-[#f2da9c]">
                    {forecast.overall}
                  </p>
                  <p className="text-xs text-[#b9b4c8]">综合指数</p>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                {(["today", "week", "month"] as ForecastPeriod[]).map(
                  (item) => (
                    <a
                      key={item}
                      href={`/zodiac?sign=${selected.id}&period=${item}`}
                      className={`rounded-full px-4 py-2 text-xs ${period === item ? "bg-[#d7b46a] text-[#1c1608]" : "bg-white/5 text-[#b9b4c8]"}`}
                    >
                      {item === "today"
                        ? "今日"
                        : item === "week"
                          ? "本周"
                          : "本月"}
                    </a>
                  ),
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["感情", "love"],
                  ["事业", "career"],
                  ["财富", "wealth"],
                  ["身心", "wellbeing"],
                ] as const
              ).map(([label, key]) => (
                <article key={key} className="glass-card rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif-cn font-bold text-[#f2da9c]">
                      {label}
                    </h3>
                    <span className="font-display text-xl text-[#d7b46a]">
                      {forecast.scores[key]}
                    </span>
                  </div>
                  <div className="mt-3 h-1 rounded-full bg-white/10">
                    <div
                      className="h-1 rounded-full bg-[#d7b46a]"
                      style={{ width: `${forecast.scores[key]}%` }}
                    />
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-[#b9b4c8]">
                    {forecast.details[key]}
                  </p>
                </article>
              ))}
            </div>
            <div className="glass-card rounded-2xl p-5 text-sm text-[#b9b4c8]">
              幸运提示：
              <span className="text-[#f2da9c]">{forecast.lucky.color}</span> ·
              数字{" "}
              <span className="text-[#f2da9c]">{forecast.lucky.number}</span> ·
              方向{" "}
              <span className="text-[#f2da9c]">{forecast.lucky.direction}</span>
            </div>
          </section>
        </div>
      </main>
    </SiteShell>
  );
}
