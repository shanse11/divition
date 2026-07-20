import { describe, expect, it } from "vitest";
import { needsResearch, researchQuestion } from "@/lib/research/service";

describe("research intent and mock fallback", () => {
  it("detects time-sensitive factual questions", () => {
    expect(needsResearch("2026 年 Valorant Champions 冠军是谁")).toBe(true);
    expect(needsResearch("苹果公司最新产品发布日期是什么？")).toBe(true);
    expect(needsResearch("今天的股价排名如何？")).toBe(true);
  });

  it("skips a self-reflection question", () => {
    expect(needsResearch("我最近的工作焦虑该如何面对")).toBe(false);
  });

  it("never fabricates sources in the default mock mode", async () => {
    const result = await researchQuestion(
      "2026 年 Valorant Champions 冠军是谁",
    );
    expect(result.status).toBe("unavailable");
    expect(result.sources).toEqual([]);
  });
});
