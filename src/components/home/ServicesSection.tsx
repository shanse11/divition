import Link from "next/link";
import {
  ArrowRight,
  CloudMoon,
  MoonStar,
  Sparkles,
  Sun,
} from "lucide-react";
import { SectionHeading, SectionReveal } from "./SectionReveal";

const services = [
  {
    icon: Sparkles,
    title: "塔罗占卜",
    description:
      "从单牌指引到凯尔特十字,选择你的牌阵,在洗牌与翻牌的仪式中获得 AI 深度解读。",
    href: "/tarot",
    cta: "进入占卜",
  },
  {
    icon: Sun,
    title: "每日运势",
    description:
      "每天一张专属于你的牌。关键词、幸运色与今日建议,陪你开启新的一天。",
    href: "/daily",
    cta: "抽取今日之牌",
  },
  {
    icon: MoonStar,
    title: "星座解读",
    description:
      "十二星座的今日、本周与本月运势。感情、事业、财运,一目了然。",
    href: "/zodiac",
    cta: "查看星座运势",
  },
  {
    icon: CloudMoon,
    title: "AI 解梦",
    description:
      "写下你的梦境,让 AI 帮你梳理其中的意象与情绪,倾听潜意识的低语。",
    href: "/dream",
    cta: "记录梦境",
  },
] as const;

export function ServicesSection() {
  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8">
      <SectionReveal>
        <SectionHeading
          eyebrow="Services"
          title="四扇通往内心的门"
          description="无论是具体的困惑,还是模糊的心绪,总有一种方式适合此刻的你。"
        />
      </SectionReveal>
      <div className="mx-auto mt-14 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service, i) => {
          const Icon = service.icon;
          return (
            <SectionReveal key={service.href} delay={i * 0.08}>
              <Link
                href={service.href}
                className="glass-card glass-card-hover group flex h-full flex-col rounded-2xl p-6"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(215,180,106,0.35)] bg-[rgba(215,180,106,0.08)] transition-colors group-hover:bg-[rgba(215,180,106,0.16)]">
                  <Icon className="h-5.5 w-5.5 text-[#d7b46a]" />
                </span>
                <h3 className="font-serif-cn mt-5 text-lg font-bold text-[#f7f1e7]">
                  {service.title}
                </h3>
                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-[#b9b4c8]">
                  {service.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm text-[#d7b46a] transition-colors group-hover:text-[#f2da9c]">
                  {service.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </SectionReveal>
          );
        })}
      </div>
    </section>
  );
}
