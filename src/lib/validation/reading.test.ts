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
});
