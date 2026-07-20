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
  const valorant = /瓦罗兰特|valorant/i.test(subject);
  return valorant
    ? [
        `site:valorantesports.com ${subject}`,
        `site:playvalorant.com ${subject}`,
        `${subject} official results schedule ranking`,
      ]
    : [
        subject,
        `${subject} official`,
        `${subject} latest results schedule ranking`,
      ];
}

const BLOCKED_HOSTS = [
  "bilibili.com",
  "douyin.com",
  "reddit.com",
  "weibo.com",
  "zhihu.com",
  "x.com",
  "twitter.com",
  "youtube.com",
  "tiktok.com",
  "facebook.com",
  "instagram.com",
  "discord.com",
  "tieba.baidu.com",
];

const OFFICIAL_HOSTS = [
  "valorantesports.com",
  "playvalorant.com",
  "riotgames.com",
];

const REPUTABLE_HOSTS = [
  "apnews.com",
  "reuters.com",
  "bbc.com",
  "espn.com",
  "theverge.com",
  "ft.com",
  "wsj.com",
  "nytimes.com",
  "bloomberg.com",
  "techcrunch.com",
];

function hostMatches(host: string, domains: string[]): boolean {
  return domains.some(
    (domain) => host === domain || host.endsWith(`.${domain}`),
  );
}

function cleanSummary(value: string): string {
  return value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\b\d{1,2}:\d{2}(?:\/\d{1,2}:\d{2})?\b/g, " ")
    .replace(/\b[\d,]+\s+(?:upvotes?|comments?)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 700);
}

function sourceTier(source: ResearchSource): ResearchSource["tier"] | null {
  let host: string;
  try {
    host = new URL(source.url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
  if (hostMatches(host, BLOCKED_HOSTS)) return null;
  if (hostMatches(host, OFFICIAL_HOSTS) || host.endsWith(".gov"))
    return "official";
  if (host.endsWith(".edu")) return "primary";
  if (hostMatches(host, REPUTABLE_HOSTS)) return "reputable";
  return null;
}

/** Remove user-generated/aggregated results and retain only sources safe to cite. */
export function curateResearchSources(
  sources: ResearchSource[],
  max: number,
): ResearchSource[] {
  const seen = new Set<string>();
  return sources
    .flatMap((source) => {
      const tier = sourceTier(source);
      const summary = cleanSummary(source.summary);
      if (!tier || !summary) return [];
      const url = new URL(source.url);
      const key = url.hostname + url.pathname.replace(/\/$/, "");
      if (seen.has(key)) return [];
      seen.add(key);
      return [{ ...source, summary, tier }];
    })
    .sort((a, b) => {
      const priority = { official: 0, primary: 1, reputable: 2, secondary: 3 };
      return priority[a.tier] - priority[b.tier];
    })
    .slice(0, max)
    .map((source, index) => ({
      ...source,
      id: `S${index + 1}`,
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
    const sources = curateResearchSources(gathered, config.maxSources);
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
      summary: `已检索到 ${sources.length} 个高可信来源；资料结论仅基于下方可追溯来源整理，最终以原始官方公告为准。`,
      factStatus,
      // 搜索摘要是候选材料，不是事实；由模型整理并绑定来源后才会展示。
      facts: [],
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
