export type TarotSuit = "major" | "wands" | "cups" | "swords" | "pentacles";

export interface TarotCardData {
  /** 唯一 ID,如 "major-0"、"wands-3" */
  id: string;
  /** 全牌库索引 0-77 */
  index: number;
  /** 中文牌名 */
  name: string;
  /** 英文牌名 */
  nameEn: string;
  /** 花色 */
  suit: TarotSuit;
  /** 大阿尔卡纳编号(0-21)或小阿尔卡纳点数(1-14,11-14 为侍从/骑士/王后/国王) */
  number: number;
  /** 展示用编号标签,如 "Ⅹ"、"侍从" */
  label: string;
  /** 正位关键词 */
  uprightKeywords: string[];
  /** 逆位关键词 */
  reversedKeywords: string[];
  /** 一句话牌意 */
  essence: string;
  /** 真实插画路径,当前为空,占位插画由 seed 生成 */
  image?: string;
}

export interface DrawnCard {
  cardId: string;
  /** 是否逆位 */
  reversed: boolean;
  /** 在牌阵中的位置索引 */
  positionIndex: number;
}

export type ReadingCategory =
  | "general"
  | "love"
  | "career"
  | "wealth"
  | "social"
  | "growth"
  | "yesno"
  | "custom";

export type ReadingStyle =
  | "gentle"
  | "rational"
  | "poetic"
  | "direct"
  | "brief"
  | "deep";

export const READING_CATEGORIES: Record<
  ReadingCategory,
  { name: string; description: string }
> = {
  general: { name: "综合指引", description: "没有特定问题,想听听当下的讯息" },
  love: { name: "感情关系", description: "恋爱、暧昧、亲密关系的困惑" },
  career: { name: "事业学业", description: "工作、学业、方向上的抉择" },
  wealth: { name: "财务趋势", description: "金钱、资源与安全感相关" },
  social: { name: "人际关系", description: "朋友、同事、家人间的相处" },
  growth: { name: "自我成长", description: "认识自己,寻找内在的力量" },
  yesno: { name: "是或否", description: "一个需要明确倾向的问题" },
  custom: { name: "自定义问题", description: "任何你想问的,都可以" },
};

export const READING_STYLES: Record<
  ReadingStyle,
  { name: string; description: string }
> = {
  gentle: { name: "温柔疗愈", description: "像一位温暖的朋友,轻声陪伴" },
  rational: { name: "理性分析", description: "条理清晰,聚焦事实与逻辑" },
  poetic: { name: "神秘诗意", description: "意象丰盈,如星夜中的低语" },
  direct: { name: "直接明确", description: "不绕弯子,直达要点" },
  brief: { name: "简洁速读", description: "要点式呈现,一分钟读完" },
  deep: { name: "深度长文", description: "层层展开,适合慢慢品读" },
};
