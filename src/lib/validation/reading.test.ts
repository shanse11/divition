import { describe, expect, it } from "vitest";
import { interpretationSchema } from "@/lib/ai/schema";
import { createReadingSchema } from "@/lib/validation/reading";

describe("reading validation", () => {
  it("rejects duplicate tarot cards", () => {
    const result = createReadingSchema.safeParse({
      kind: "tarot",
      category: "general",
      question: "",
      spreadId: "past-present-future",
      style: "gentle",
      cards: [0, 1, 2].map((positionIndex) => ({
        cardId: "major-0",
        reversed: false,
        positionIndex,
      })),
    });
    expect(result.success).toBe(false);
  });
  it("validates structured AI output", () => {
    const result = interpretationSchema.safeParse({
      theme: "主题",
      overview: "概览",
      cards: [
        {
          positionIndex: 0,
          positionName: "现状",
          text: "解读",
          keywords: ["觉察"],
        },
      ],
      connections: "关联",
      situation: "处境",
      obstacles: "阻碍",
      advice: ["建议"],
      signs: "迹象",
      summary: "总结",
      disclaimer: "仅供娱乐",
    });
    expect(result.success).toBe(true);
  });
  it("accepts research data while keeping legacy interpretations compatible", () => {
    const legacy = interpretationSchema.safeParse({
      theme: "主题",
      overview: "概览",
      cards: [
        { positionIndex: 0, positionName: "现状", text: "解读", keywords: [] },
      ],
      connections: "关联",
      situation: "处境",
      obstacles: "阻碍",
      advice: ["建议"],
      signs: "迹象",
      summary: "总结",
      disclaimer: "仅供娱乐",
    });
    const researched = interpretationSchema.safeParse({
      ...legacy.data,
      research: {
        status: "completed",
        asOfDate: "2026-07-20",
        summary: "资料结论",
        factStatus: "current",
        facts: [{ claim: "事实 [S1]", sourceIds: ["S1"] }],
        decisionVariables: ["变量"],
        uncertainties: [],
        sources: [
          {
            id: "S1",
            title: "官方来源",
            url: "https://example.com",
            publisher: "Example",
            publishedAt: null,
            tier: "official",
            summary: "已清洗摘要",
          },
        ],
      },
      tarotPerspective: "象征性观察",
    });
    expect(legacy.success).toBe(true);
    expect(researched.success).toBe(true);
  });
  it("rejects unsafe research source protocols", () => {
    const result = interpretationSchema.safeParse({
      theme: "主题",
      overview: "概览",
      cards: [
        { positionIndex: 0, positionName: "现状", text: "解读", keywords: [] },
      ],
      connections: "关联",
      situation: "处境",
      obstacles: "阻碍",
      advice: ["建议"],
      signs: "迹象",
      summary: "总结",
      disclaimer: "仅供娱乐",
      research: {
        status: "completed",
        asOfDate: null,
        summary: "资料",
        factStatus: "current",
        facts: [],
        decisionVariables: [],
        uncertainties: [],
        sources: [
          {
            id: "S1",
            title: "x",
            url: "javascript:alert(1)",
            publisher: "x",
            publishedAt: null,
            tier: "official",
            summary: "x",
          },
        ],
      },
    });
    expect(result.success).toBe(false);
  });
});
