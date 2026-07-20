import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { DailyPreview } from "./DailyPreview";
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
    quote: "抽牌的仪式感让我愿意慢下来,把原本纠结的问题换一个角度重新看看。",
    author: "匿名体验情境 · 三张牌牌阵",
  },
  {
    quote: "每天留一分钟看一张牌,更像一种温柔的自我检查,而不是寻找确定答案。",
    author: "匿名体验情境 · 每日一牌",
  },
  {
    quote:
      "解梦中的提示问题让我重新整理最近的感受,也提醒我尊重梦境的个人含义。",
    author: "匿名体验情境 · AI 解梦",
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
  {
    q: "同一天的每日一牌会改变吗?",
    a: "不会。今日之牌会依据你的匿名访客标识或账号与日期稳定生成,当天刷新页面仍会看到同一张牌。",
  },
  {
    q: "可以删除占卜记录和账号数据吗?",
    a: "可以。你可以在记录页删除单条或多条记录；登录用户也可以在个人中心导出数据或申请删除账号。",
  },
  {
    q: "占卜能替代专业建议吗?",
    a: "不能。本站内容不构成医疗、心理、法律、投资或其他专业建议。遇到重要或紧急问题时,请寻求合格专业人士帮助。",
  },
  {
    q: "为什么同一个问题可能得到不同解读?",
    a: "抽到的牌、牌位、正逆位和你提供的语境都会影响解读。它们适合用来启发思考,不代表唯一答案或确定的未来。",
  },
] as const;

export function ClosingSection() {
  return (
    <section className="relative px-4 pt-8 pb-24 sm:px-6 lg:px-8">
      {/* 今日之牌 + 星座入口 */}
      <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1.1fr_1fr]">
        <SectionReveal>
          <DailyPreview />
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
                  className="group flex min-h-11 flex-col items-center gap-1 rounded-xl border border-transparent px-2 py-3 transition-all hover:border-[rgba(215,180,106,0.3)] hover:bg-[rgba(215,180,106,0.06)] focus-visible:border-[rgba(215,180,106,0.5)] focus-visible:ring-2 focus-visible:ring-[#d7b46a] focus-visible:outline-none"
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
            title="匿名体验情境"
            description="以下为帮助理解产品体验的虚构示例,不是用户评价、效果承诺或真实性声明。"
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
