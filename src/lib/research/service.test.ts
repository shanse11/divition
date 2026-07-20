import { describe, expect, it } from "vitest";
import {
  curateResearchSources,
  needsResearch,
  researchQuestion,
} from "@/lib/research/service";

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

  it("filters user-generated sources and prioritizes official sources", () => {
    const sources = curateResearchSources(
      [
        {
          id: "",
          title: "Community post",
          url: "https://www.reddit.com/r/example/comments/1",
          publisher: "reddit.com",
          publishedAt: null,
          tier: "secondary",
          summary: "445 upvotes, 93 comments None",
        },
        {
          id: "",
          title: "News coverage",
          url: "https://www.espn.com/esports/story",
          publisher: "espn.com",
          publishedAt: null,
          tier: "secondary",
          summary: "A clean report about the event.",
        },
        {
          id: "",
          title: "Official standings",
          url: "https://valorantesports.com/standings",
          publisher: "valorantesports.com",
          publishedAt: null,
          tier: "secondary",
          summary: "Official standings and schedule.",
        },
      ],
      6,
    );

    expect(sources.map((source) => source.url)).toEqual([
      "https://valorantesports.com/standings",
      "https://www.espn.com/esports/story",
    ]);
    expect(sources[0]).toMatchObject({ id: "S1", tier: "official" });
  });
});
