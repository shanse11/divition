import Link from "next/link";
import { ArrowRight, Quote, Sun } from "lucide-react";
import { TarotCardBack } from "@/components/tarot/TarotCardBack";
import { zodiacSigns } from "@/data/zodiac";
import { SectionHeading, SectionReveal } from "./SectionReveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const testimonials = [
  {
    quote:
      "抽牌那一刻真的很有仪式感,解读也不是模板话,像有人认真听完了我的问题。",
    author: "匿名旅人 · 使用三张牌牌阵",
  },
  {
    quote:
      "每天早上抽一张今日之牌已经成了习惯,连续打卡四十多天,像一种温柔的自我检查。",
    author: "匿名旅人 · 每日一牌用户",
  },
  {
    quote:
      "解梦功能把我反复出现的梦拆解得很细,那些问题让我第一次认真想了想自己最近的状态。",
    author: "匿名旅人 · AI 解梦用户",
  },
] as const;

const faqs = [
  {
    q: "占卜结果准吗?",
    a: "塔罗与星座内容仅供娱乐与自我反思。牌面提供的是一种看待问题的视角,而不是既定的命运。真正的答案,始终由你自己书写。",
  },
  {
    q: "我的问题会被保存或公开吗?",
    a: "你的问题默认仅自己可见。生成分享图时,私人问题默认隐藏,除非你主动选择展示。你也可以随时删除任何一条历史记录。",
  },
  {
    q: "不登录可以使用吗?",
    a: "可以。塔罗占卜、每日一牌、星座与解梦都支持游客体验。登录后可以跨设备保存历史记录、收藏与连续打卡进度。",
  },
  {
    q: "AI 解读是如何生成的?",
    a: "AI 会综合你的问题、所选牌阵、每张牌的正逆位与牌位含义生成结构化解读。未配置 AI 服务时,会使用内置的本地解读引擎。",
  },
] as const;

export function ClosingSection() {
  return (
    <section className="relative px-4 pt-8 pb-24 sm:px-6 lg:px-8">
      {/* 今日之牌 + 星座入口 */}
      <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1.1fr_1fr]">
        <SectionReveal>
          <div className="glass-card relative flex h-full flex-col justify-between overflow-hidden rounded-2xl p-8">
            <div className="relative z-10 max-w-sm">
              <p className="font-display text-[11px] tracking-[0.35em] text-[#d7b46a] uppercase">
                Daily Card
              </p>
              <h3 className="font-serif-cn mt-3 text-2xl font-bold text-[#f7f1e7]">
                今日之牌,正在等你翻开
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#b9b4c8]">
                每天一张专属于你的牌。同一天里,无论刷新多少次,它都会安静地保持原样——就像一个只对你说一次的秘密。
              </p>
              <Link
                href="/daily"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-[rgba(215,180,106,0.4)] px-5 py-2.5 text-sm text-[#f2da9c] transition-colors hover:bg-[rgba(215,180,106,0.1)]"
              >
                <Sun className="h-4 w-4" />
                抽取今日之牌
              </Link>
            </div>
            <div className="absolute -right-6 -bottom-10 w-36 rotate-12 opacity-80 sm:w-44">
              <TarotCardBack />
            </div>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <div className="glass-card h-full rounded-2xl p-8">
            <p className="font-display text-[11px] tracking-[0.35em] text-[#d7b46a] uppercase">
              Zodiac
            </p>
            <h3 className="font-serif-cn mt-3 text-2xl font-bold text-[#f7f1e7]">
              十二星座快捷入口
            </h3>
            <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {zodiacSigns.map((sign) => (
                <Link
                  key={sign.id}
                  href={`/zodiac?sign=${sign.id}`}
                  className="group flex flex-col items-center gap-1 rounded-xl border border-transparent px-2 py-3 transition-all hover:border-[rgba(215,180,106,0.3)] hover:bg-[rgba(215,180,106,0.06)]"
                  aria-label={`查看${sign.name}运势`}
                >
                  <span className="text-xl text-[#d7b46a] transition-transform group-hover:scale-110">
                    {sign.symbol}
                  </span>
                  <span className="text-[11px] text-[#b9b4c8] group-hover:text-[#f7f1e7]">
                    {sign.name.slice(0, 2)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </SectionReveal>
      </div>

      {/* 用户评价 */}
      <div className="mx-auto mt-24 max-w-6xl">
        <SectionReveal>
          <SectionHeading
            eyebrow="Voices"
            title="来自旅人们的低语"
            description="他们在这里遇见的,或许也是你正在寻找的。"
          />
        </SectionReveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((item, i) => (
            <SectionReveal key={i} delay={i * 0.08}>
              <figure className="glass-card flex h-full flex-col rounded-2xl p-7">
                <Quote className="h-6 w-6 text-[#d7b46a]/60" aria-hidden />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-[#f7f1e7]/90">
                  {item.quote}
                </blockquote>
                <figcaption className="mt-5 text-xs text-[#b9b4c8]/80">
                  {item.author}
                </figcaption>
              </figure>
            </SectionReveal>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mx-auto mt-24 max-w-3xl">
        <SectionReveal>
          <SectionHeading eyebrow="FAQ" title="常见问题" />
        </SectionReveal>
        <SectionReveal delay={0.1}>
          <Accordion type="single" collapsible className="mt-10">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border-[rgba(215,180,106,0.12)]"
              >
                <AccordionTrigger className="font-serif-cn text-left text-[15px] text-[#f7f1e7] hover:text-[#f2da9c] hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-[#b9b4c8]">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </SectionReveal>
      </div>

      {/* 结尾 CTA */}
      <SectionReveal delay={0.05}>
        <div className="mx-auto mt-24 max-w-2xl text-center">
          <h2 className="font-serif-cn text-3xl font-bold text-balance text-[#f7f1e7]">
            此刻的你,想问什么?
          </h2>
          <Link
            href="/tarot"
            className="btn-gold-shimmer mt-8 inline-flex h-12 items-center gap-2 rounded-lg bg-[#d7b46a] px-8 text-base font-medium text-[#1c1608] transition-colors hover:bg-[#f2da9c]"
          >
            开始占卜
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </SectionReveal>
    </section>
  );
}
