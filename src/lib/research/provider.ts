import "server-only";
import type { ResearchSource } from "@/types/reading";

export interface ResearchProvider {
  readonly name: "mock" | "tavily";
  search(query: string, maxResults: number): Promise<ResearchSource[]>;
}

export interface ResearchConfig {
  provider: "mock" | "tavily";
  apiKey: string;
  timeoutMs: number;
  maxSources: number;
}

export function loadResearchConfig(): ResearchConfig {
  const provider =
    process.env.RESEARCH_PROVIDER === "tavily" && process.env.RESEARCH_API_KEY
      ? "tavily"
      : "mock";
  const timeout = Number(process.env.RESEARCH_TIMEOUT ?? 12_000);
  const max = Number(process.env.RESEARCH_MAX_SOURCES ?? 6);
  return {
    provider,
    apiKey: process.env.RESEARCH_API_KEY ?? "",
    timeoutMs: Number.isFinite(timeout)
      ? Math.min(Math.max(timeout, 3_000), 30_000)
      : 12_000,
    maxSources: Number.isFinite(max)
      ? Math.min(Math.max(Math.floor(max), 1), 8)
      : 6,
  };
}
