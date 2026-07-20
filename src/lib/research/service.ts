import "server-only";
import type {
  FactStatus,
  ResearchContext,
  ResearchSource,
} from "@/types/reading";
import { logger } from "@/lib/logger";
import {
  loadResearchConfig,
  type ResearchProvider,
} from "@/lib/research/provider";
import { MockResearchProvider } from "@/lib/research/providers/mock";
import { TavilyResearchProvider } from "@/lib/research/providers/tavily";

const TIME_SENSITIVE =
  /\b(20\d{2}|today|latest|news|price|rank(?:ing)?|champion|match|stock|policy|election|company|product)\b|今天|当前|最新|新闻|价格|股价|排名|冠军|赛程|比赛|赛事|公司|人物|政策|选举|市场|瓦罗兰特|Valorant/i;
const FUTURE =
  /\b(will|predict|next|future|202[6-9])\b|预测|会不会|将会|未来|明年|冠军是谁/i;
let cached: ResearchProvider | null = null;

export function needsResearch(question: string): boolean {
  return TIME_SENSITIVE.test(question.slice(0, 200));
}
function empty(
  status: ResearchContext["status"],
  summary: string,
  factStatus: FactStatus,
): ResearchContext {
  return {
    status,
    asOfDate: null,
    summary,
    factStatus,
    facts: [],
    decisionVariables: [],
    uncertainties: [],
    sources: [],
  };
}
export function getResearchProvider(): ResearchProvider {
  if (cached) return cached;
  const config = loadResearchConfig();
  cached =
    config.provider === "tavily"
      ? new TavilyResearchProvider(config)
      : new MockResearchProvider();
  logger.info("research.provider_selected", { provider: cached.name });
  return cached;
}
function plan(question: string) {
  const subject = question
    .replace(/[？?！!。]/g, " ")
    .trim()
    .slice(0, 160);
  return [
    subject,
    `${subject} official`,
    `${subject} latest results schedule ranking`,
  ];
}
function sourceTier(source: ResearchSource): ResearchSource["tier"] {
  const host = new URL(source.url).hostname.toLowerCase();
  return /(^|\.)(gov|edu|org)$/.test(host) ||
    /riotgames|valorantesports|official/.test(host)
    ? "official"
    : "reputable";
}
function dedupe(sources: ResearchSource[], max: number): ResearchSource[] {
  const seen = new Set<string>();
  return sources
    .filter((source) => {
      const key =
        new URL(source.url).hostname +
        new URL(source.url).pathname.replace(/\/$/, "");
      if (seen.has(key) || !source.summary) return false;
      seen.add(key);
      return true;
    })
    .slice(0, max)
    .map((source, index) => ({
      ...source,
      id: `S${index + 1}`,
      tier: sourceTier(source),
    }));
}
export async function researchQuestion(
  question: string,
): Promise<ResearchContext> {
  const normalized = question.trim().slice(0, 200);
  if (!normalized || !needsResearch(normalized))
    return empty(
      "not_needed",
      "该问题以自我反思为主，不需要外部实时资料。",
      "current",
    );
  const provider = getResearchProvider();
  const factStatus: FactStatus = FUTURE.test(normalized) ? "future" : "current";
  if (provider.name === "mock")
    return {
      ...empty(
        "unavailable",
        "当前为离线演示模式，未连接实时资料服务。",
        factStatus,
      ),
      uncertainties: ["未发起网络检索；本次仅提供塔罗象征解读。"],
    };
  try {
    const config = loadResearchConfig();
    const gathered = (
      await Promise.all(
        plan(normalized).map((query) => provider.search(query, 3)),
      )
    ).flat();
    const sources = dedupe(gathered, config.maxSources);
    if (!sources.length)
      return {
        ...empty(
          "unavailable",
          "未能获取可用的实时资料。本次仅提供塔罗象征解读。",
          factStatus,
        ),
        uncertainties: ["检索服务没有返回可安全展示的来源。"],
      };
    const asOfDate = new Date().toISOString().slice(0, 10);
    return {
      status: sources.length < 3 ? "partial" : "completed",
      asOfDate,
      summary: `已检索到 ${sources.length} 个可访问来源；以下资料用于建立事实底座，最终结论仍须以原始官方公告为准。`,
      factStatus,
      facts: sources
        .slice(0, 3)
        .map((source) => ({ claim: source.summary, sourceIds: [source.id] })),
      decisionVariables: [
        "官方公告与赛程/状态更新",
        "近期可验证的表现与可用信息",
        "尚未发生事件中的临场变量",
      ],
      uncertainties:
        factStatus === "future"
          ? ["未来事件尚未发生，资料不能构成确定结果或概率承诺。"]
          : ["搜索结果可能滞后；关键事实请打开原始来源复核。"],
      sources,
    };
  } catch (error) {
    logger.warn("research.unavailable", {
      provider: provider.name,
      message: error instanceof Error ? error.message : "unknown",
    });
    return {
      ...empty(
        "unavailable",
        "未能获取实时资料。本次仅提供塔罗象征解读。",
        factStatus,
      ),
      uncertainties: ["实时资料服务暂时不可用。"],
    };
  }
}
