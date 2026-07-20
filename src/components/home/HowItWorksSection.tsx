import { BrainCircuit, Hand, HelpCircle, LayoutGrid } from "lucide-react";
import { SectionHeading, SectionReveal } from "./SectionReveal";

const steps = [
  {
    icon: HelpCircle,
    step: "壹",
    title: "静心并提出问题",
    description: "深呼吸,让思绪沉淀。把心里盘旋的疑问,凝练成一句真诚的话。",
  },
  {
    icon: LayoutGrid,
    step: "贰",
    title: "选择牌阵",
    description:
      "简单的问题一张牌足矣,复杂的心事交给凯尔特十字。每种牌阵都有它的语言。",
  },
  {
    icon: Hand,
    step: "叁",
    title: "洗牌并抽牌",
    description: "卡牌在指尖流转,凭直觉停下。你抽到的每一张牌,都不是偶然。",
  },
  {
    icon: BrainCircuit,
    step: "肆",
    title: "获得 AI 深度解读",
    description: "AI 结合牌面、正逆位与牌位关系,为你展开一份结构完整的指引。",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8">
      <SectionReveal>
        <SectionHeading
          eyebrow="Ritual"
          title="占卜如何进行"
          description="四个步骤,一场与内心的对话仪式。"
        />
      </SectionReveal>
      <div className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((item, i) => {
          const Icon = item.icon;
          return (
            <SectionReveal key={item.step} delay={i * 0.08}>
              <div className="relative flex h-full flex-col items-center rounded-2xl px-5 py-8 text-center">
                {/* 连接线 */}
                {i < steps.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute top-16 left-[calc(50%+3rem)] hidden h-px w-[calc(100%-6rem)] bg-gradient-to-r from-[rgba(215,180,106,0.4)] to-transparent lg:block"
                  />
                )}
                <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(215,180,106,0.35)] bg-[rgba(215,180,106,0.06)]">
                  <Icon className="h-6 w-6 text-[#d7b46a]" />
                  <span className="font-serif-cn absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-[rgba(215,180,106,0.5)] bg-[#111323] text-[10px] text-[#f2da9c]">
                    {item.step}
                  </span>
                </span>
                <h3 className="font-serif-cn mt-5 text-base font-bold text-[#f7f1e7]">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#b9b4c8]">
                  {item.description}
                </p>
              </div>
            </SectionReveal>
          );
        })}
      </div>
    </section>
  );
}
