import type { DrawnCard, ReadingCategory, ReadingStyle } from "@/types/tarot";

/** AI 结构化解读结果 */
export interface Interpretation {
  /** 本次占卜主题 */
  theme: string;
  /** 整体能量概览 */
  overview: string;
  /** 每张牌的详细解读(与抽牌顺序一致) */
  cards: CardInterpretationItem[];
  /** 卡牌之间的关联 */
  connections: string;
  /** 当前处境分析 */
  situation: string;
  /** 潜在阻碍 */
  obstacles: string;
  /** 行动建议 */
  advice: string[];
  /** 值得关注的时间或迹象 */
  signs: string;
  /** 一句总结 */
  summary: string;
  /** 免责声明 */
  disclaimer: string;
  /** 仅在需要现实资料的问题中附带；历史记录可安全缺失。 */
  research?: ResearchContext;
  /** 将牌面与现实变量分开的象征性观察。 */
  tarotPerspective?: string;
}

export type ResearchStatus =
  "not_needed" | "unavailable" | "completed" | "partial";
export type FactStatus = "past" | "current" | "future" | "mixed";

export interface ResearchSource {
  id: string;
  title: string;
  url: string;
  publisher: string;
  publishedAt: string | null;
  tier: "official" | "primary" | "reputable" | "secondary";
  summary: string;
}

export interface ResearchContext {
  status: ResearchStatus;
  asOfDate: string | null;
  summary: string;
  factStatus: FactStatus;
  facts: Array<{ claim: string; sourceIds: string[] }>;
  decisionVariables: string[];
  uncertainties: string[];
  sources: ResearchSource[];
}

export interface CardInterpretationItem {
  /** 对应 DrawnCard.positionIndex */
  positionIndex: number;
  /** 牌位名称 */
  positionName: string;
  /** 解读文字 */
  text: string;
  /** 关键词 */
  keywords: string[];
}

export type ReadingKind = "tarot" | "relationship" | "daily" | "dream";

/** 一次完整的占卜记录 */
export interface ReadingRecord {
  id: string;
  kind: ReadingKind;
  category: ReadingCategory;
  question: string;
  spreadId: string;
  style: ReadingStyle;
  cards: DrawnCard[];
  interpretation: Interpretation | null;
  favorite: boolean;
  note: string;
  createdAt: string;
}
