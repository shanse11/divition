import { getCardById } from "@/data/tarot-cards";
import { getSpreadById } from "@/data/spreads";
import { READING_CATEGORIES, READING_STYLES } from "@/types/tarot";
import type { ReadingRecord } from "@/types/reading";
import { TarotCardFace } from "@/components/tarot/TarotCardFace";
import {
  Compass,
  Link2,
  ListChecks,
  MountainSnow,
  ScrollText,
  Sparkles,
  Telescope,
  ExternalLink,
  DatabaseZap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ReadingResultProps {
  reading: ReadingRecord;
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-card rounded-2xl p-6 sm:p-8">
      <h2 className="font-serif-cn flex items-center gap-2.5 text-lg font-bold text-[#f2da9c]">
        <Icon className="h-5 w-5 text-[#d7b46a]" aria-hidden />
        {title}
      </h2>
      <div className="mt-4 text-[15px] leading-relaxed text-[#f7f1e7]/90">
        {children}
      </div>
    </section>
  );
}

/** 占卜结果的完整展示(服务端组件) */
export function ReadingResult({ reading }: ReadingResultProps) {
  const spread = getSpreadById(reading.spreadId);
  const interp = reading.interpretation;
  if (!interp) {
    return (
      <p className="text-center text-[#b9b4c8]">解读尚未生成,请稍后刷新。</p>
    );
  }

  return (
    <div className="space-y-5">
      {/* 头部:主题与元信息 */}
      <header className="text-center">
        <p className="font-display text-[11px] tracking-[0.35em] text-[#d7b46a] uppercase">
          {spread?.nameEn ?? "Tarot Reading"}
        </p>
        <h1 className="font-serif-cn mt-3 text-2xl font-bold text-balance text-[#f7f1e7] sm:text-3xl">
          {interp.theme}
        </h1>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-[#b9b4c8]">
          <span className="rounded-full border border-[rgba(215,180,106,0.25)] px-3 py-1">
            {READING_CATEGORIES[reading.category]?.name}
          </span>
          <span className="rounded-full border border-[rgba(215,180,106,0.25)] px-3 py-1">
            {spread?.name}
          </span>
          <span className="rounded-full border border-[rgba(215,180,106,0.25)] px-3 py-1">
            {READING_STYLES[reading.style]?.name}
          </span>
          <time
            className="rounded-full border border-[rgba(215,180,106,0.25)] px-3 py-1"
            dateTime={reading.createdAt}
          >
            {new Date(reading.createdAt).toLocaleString("zh-CN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </time>
        </div>
        {reading.question && (
          <p className="mx-auto mt-5 max-w-lg text-sm text-[#b9b4c8] italic">
            「{reading.question}」
          </p>
        )}
      </header>

      {/* 牌面横排展示 */}
      <div className="-mx-4 flex scrollbar-none gap-4 overflow-x-auto px-4 py-4 sm:justify-center">
        {reading.cards.map((drawn) => {
          const card = getCardById(drawn.cardId);
          const position = spread?.positions.find(
            (p) => p.index === drawn.positionIndex,
          );
          if (!card) return null;
          return (
            <figure key={drawn.positionIndex} className="w-24 shrink-0 sm:w-28">
              <TarotCardFace
                name={card.name}
                nameEn={card.nameEn}
                label={card.label}
                seed={card.index + 1}
                suit={card.suit}
                image={card.image}
                reversed={drawn.reversed}
                className="text-[10px]"
              />
              <figcaption className="mt-2 text-center">
                <p className="text-xs font-medium text-[#f2da9c]">
                  {position?.name}
                </p>
                <p className="mt-0.5 text-[11px] text-[#b9b4c8]">
                  {card.name}
                  {drawn.reversed ? " · 逆位" : " · 正位"}
                </p>
              </figcaption>
            </figure>
          );
        })}
      </div>

      {interp.research?.status === "unavailable" && (
        <p className="rounded-xl border border-[rgba(215,180,106,0.2)] bg-[rgba(215,180,106,0.06)] px-4 py-3 text-center text-sm text-[#b9b4c8]">
          {interp.research.summary}
        </p>
      )}
      {(interp.research?.status === "completed" ||
        interp.research?.status === "partial") && (
        <Section icon={DatabaseZap} title="现实资料">
          <div className="space-y-5 break-words">
            <div>
              <h3 className="font-medium text-[#f2da9c]">现实资料结论</h3>
              <p className="mt-1">{interp.research.summary}</p>
            </div>
            {interp.research.asOfDate && (
              <p className="text-sm text-[#b9b4c8]">
                截至日期：{interp.research.asOfDate}
              </p>
            )}
            {interp.research.facts.length > 0 && (
              <div>
                <h3 className="font-medium text-[#f2da9c]">已确认事实</h3>
                <ul className="mt-2 space-y-2">
                  {interp.research.facts.map((fact, i) => (
                    <li key={i}>• {fact.claim}</li>
                  ))}
                </ul>
              </div>
            )}
            {interp.research.decisionVariables.length > 0 && (
              <div>
                <h3 className="font-medium text-[#f2da9c]">决定性变量</h3>
                <p className="mt-1">
                  {interp.research.decisionVariables.join("、")}
                </p>
              </div>
            )}
            {interp.research.uncertainties.length > 0 && (
              <div>
                <h3 className="font-medium text-[#f2da9c]">不确定性与局限</h3>
                <ul className="mt-2 space-y-2">
                  {interp.research.uncertainties.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
            {interp.research.sources.length > 0 && (
              <div>
                <h3 className="font-medium text-[#f2da9c]">来源</h3>
                <ul className="mt-2 space-y-3">
                  {interp.research.sources.map((source) => (
                    <li key={source.id}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex max-w-full items-center gap-1 text-[#d7b46a] hover:text-[#f2da9c]"
                      >
                        <span className="truncate">
                          [{source.id}] {source.title}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      </a>
                      <p className="text-xs text-[#b9b4c8]">
                        {source.publisher}
                        {source.publishedAt ? ` · ${source.publishedAt}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>
      )}
      {interp.tarotPerspective && (
        <Section icon={Sparkles} title="塔罗视角">
          <p>{interp.tarotPerspective}</p>
        </Section>
      )}

      {/* 整体能量 */}
      <Section icon={Telescope} title="整体能量概览">
        <p>{interp.overview}</p>
      </Section>

      {/* 每张牌解读 */}
      <Section icon={ScrollText} title="逐牌解读">
        <div className="space-y-6">
          {interp.cards.map((item) => {
            const drawn = reading.cards.find(
              (c) => c.positionIndex === item.positionIndex,
            );
            const card = drawn ? getCardById(drawn.cardId) : undefined;
            return (
              <article
                key={item.positionIndex}
                className="border-l-2 border-[rgba(215,180,106,0.3)] pl-4"
              >
                <h3 className="font-serif-cn text-base font-bold text-[#f7f1e7]">
                  {item.positionName}
                  {card && (
                    <span className="ml-2 text-sm font-normal text-[#d7b46a]">
                      {card.name}
                      {drawn?.reversed ? "(逆位)" : "(正位)"}
                    </span>
                  )}
                </h3>
                {item.keywords.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {item.keywords.map((keyword) => (
                      <li
                        key={keyword}
                        className="rounded-full bg-[rgba(215,180,106,0.1)] px-2.5 py-0.5 text-[11px] text-[#d7b46a]"
                      >
                        {keyword}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-2.5">{item.text}</p>
              </article>
            );
          })}
        </div>
      </Section>

      {/* 关联 + 处境 */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Section icon={Link2} title="卡牌之间的关联">
          <p>{interp.connections}</p>
        </Section>
        <Section icon={Compass} title="当前处境">
          <p>{interp.situation}</p>
        </Section>
      </div>

      {/* 阻碍 */}
      <Section icon={MountainSnow} title="潜在阻碍">
        <p>{interp.obstacles}</p>
      </Section>

      {/* 建议 */}
      <Section icon={ListChecks} title="行动建议">
        <ul className="space-y-2.5">
          {interp.advice.map((advice, i) => (
            <li key={i} className="flex gap-3">
              <span
                className="font-display mt-0.5 shrink-0 text-sm text-[#d7b46a]"
                aria-hidden
              >
                {["Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ"][i] ?? "·"}
              </span>
              {advice}
            </li>
          ))}
        </ul>
      </Section>

      {/* 迹象 + 总结 */}
      <Section icon={Sparkles} title="值得关注的迹象">
        <p>{interp.signs}</p>
      </Section>

      <blockquote className="glass-card rounded-2xl border-[rgba(215,180,106,0.3)] p-8 text-center">
        <p className="font-serif-cn text-lg leading-relaxed text-[#f2da9c]">
          {interp.summary}
        </p>
      </blockquote>

      <p className="px-4 text-center text-xs leading-relaxed text-[#b9b4c8]/70">
        {interp.disclaimer}
      </p>
    </div>
  );
}
