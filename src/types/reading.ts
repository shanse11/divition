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
