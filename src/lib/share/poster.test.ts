import { describe, expect, it } from "vitest";
import {
  DEFAULT_POSTER_OPTIONS,
  derivePosterContent,
  type PosterReading,
} from "@/lib/share/poster";

const reading: PosterReading = {
  id: "reading-private",
  question: "这是我的私人问题",
  spread: { name: "时间之流", nameEn: "Past · Present · Future" },
  createdAt: "2026-07-20T10:30:00.000Z",
  theme: "穿过迷雾",
  summary: "相信清晰会逐步出现。",
  advice: ["先记录事实", "留出思考时间"],
  disclaimer: "仅供娱乐与自我反思",
  cards: [
    {
      id: "major-18",
      name: "月亮",
      nameEn: "The Moon",
      label: "ⅩⅧ",
      suit: "major",
      seed: 19,
      position: "现在",
      reversed: true,
      keywords: ["迷雾", "直觉"],
      interpretation: "分辨感受与事实。",
    },
  ],
};

describe("poster privacy and content derivation", () => {
  it("uses private defaults that omit question and detailed interpretation", () => {
    const content = derivePosterContent(reading, DEFAULT_POSTER_OPTIONS);

    expect(DEFAULT_POSTER_OPTIONS.showQuestion).toBe(false);
    expect(DEFAULT_POSTER_OPTIONS.showFullCardReadings).toBe(false);
    expect(DEFAULT_POSTER_OPTIONS.showAdvice).toBe(false);
    expect(content.question).toBeUndefined();
    expect(content.cards[0]?.interpretation).toBeUndefined();
    expect(content.advice).toEqual([]);
  });

  it("includes explicitly selected reading sections and card metadata", () => {
    const content = derivePosterContent(reading, {
      ...DEFAULT_POSTER_OPTIONS,
      showQuestion: true,
      showFullCardReadings: true,
      showAdvice: true,
      showSpread: true,
      showDate: true,
      showLogo: true,
      showDisclaimer: true,
    });

    expect(content.question).toBe(reading.question);
    expect(content.spread).toBe("时间之流");
    expect(content.date).toBe("2026年7月20日");
    expect(content.logo).toBe("Astral Oracle");
    expect(content.disclaimer).toBe(reading.disclaimer);
    expect(content.advice).toEqual(reading.advice);
    expect(content.cards[0]).toMatchObject({
      name: "月亮",
      position: "现在",
      orientation: "逆位",
      keywords: ["迷雾", "直觉"],
      interpretation: "分辨感受与事实。",
    });
  });

  it("never invents optional private content when source fields are empty", () => {
    const content = derivePosterContent(
      { ...reading, question: "", advice: [], disclaimer: "" },
      {
        ...DEFAULT_POSTER_OPTIONS,
        showQuestion: true,
        showAdvice: true,
        showDisclaimer: true,
      },
    );

    expect(content.question).toBeUndefined();
    expect(content.advice).toEqual([]);
    expect(content.disclaimer).toBeUndefined();
  });
});
