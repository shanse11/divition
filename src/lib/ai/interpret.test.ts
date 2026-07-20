import { describe, expect, it } from "vitest";
import { mergeResearchContext } from "@/lib/ai/interpret";
import type { ResearchContext } from "@/types/reading";

const runtime: ResearchContext = {
  status: "completed",
  asOfDate: "2026-07-20",
  summary: "已检索到高可信来源。",
  factStatus: "future",
  facts: [],
  decisionVariables: [],
  uncertainties: ["未来事件尚未发生。"],
  sources: [
    {
      id: "S1",
      title: "Official source",
      url: "https://valorantesports.com/news",
      publisher: "valorantesports.com",
      publishedAt: null,
      tier: "official",
      summary: "Official event information.",
    },
  ],
};

describe("mergeResearchContext", () => {
  it("keeps runtime sources and drops model facts without a real source", () => {
    const result = mergeResearchContext(runtime, {
      ...runtime,
      summary: "资料显示赛事仍在进行，尚无官方冠军结果。",
      facts: [
        { claim: "赛事仍在进行 [S1]", sourceIds: ["S1"] },
        { claim: "模型编造的结论", sourceIds: ["S9"] },
      ],
      sources: [
        { ...runtime.sources[0], id: "S9", url: "https://example.com" },
      ],
    });

    expect(result.sources).toEqual(runtime.sources);
    expect(result.facts).toEqual([
      { claim: "赛事仍在进行 [S1]", sourceIds: ["S1"] },
    ]);
  });
});
