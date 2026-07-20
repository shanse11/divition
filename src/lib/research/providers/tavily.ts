import "server-only";
import type { ResearchSource } from "@/types/reading";
import type { ResearchConfig, ResearchProvider } from "@/lib/research/provider";
import { logger } from "@/lib/logger";

interface TavilyResponse {
  results?: Array<{
    title?: string;
    url?: string;
    content?: string;
    published_date?: string;
  }>;
}

function safeUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function bounded(value: string | undefined, max: number) {
  return (value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export class TavilyResearchProvider implements ResearchProvider {
  readonly name = "tavily" as const;
  constructor(private readonly config: ResearchConfig) {}

  async search(query: string, maxResults: number): Promise<ResearchSource[]> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);
      try {
        const response = await fetch("https://api.tavily.com/search", {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: this.config.apiKey,
            query: bounded(query, 180),
            max_results: Math.min(maxResults, 8),
            search_depth: "basic",
            include_answer: false,
          }),
        });
        if (!response.ok)
          throw new Error(`Research provider returned ${response.status}`);
        const data = (await response.json()) as TavilyResponse;
        return (data.results ?? []).flatMap((result) => {
          const url = safeUrl(result.url);
          if (!url) return [];
          const hostname = new URL(url).hostname.replace(/^www\./, "");
          return [
            {
              id: "",
              title: bounded(result.title, 300) || hostname,
              url,
              publisher: hostname,
              publishedAt: /^\d{4}-\d{2}-\d{2}/.test(
                result.published_date ?? "",
              )
                ? result.published_date!.slice(0, 10)
                : null,
              tier: "secondary" as const,
              summary: bounded(result.content, 250),
            },
          ];
        });
      } catch (error) {
        lastError = error;
        logger.warn("research.request_error", {
          provider: this.name,
          attempt,
          message: error instanceof Error ? error.message : "unknown",
        });
      } finally {
        clearTimeout(timer);
      }
    }
    throw lastError instanceof Error
      ? lastError
      : new Error("Research request failed");
  }
}
