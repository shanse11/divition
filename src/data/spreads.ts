export interface SpreadPosition {
  /** 位置索引,从 0 开始 */
  index: number;
  /** 牌位名称 */
  name: string;
  /** 牌位含义说明 */
  meaning: string;
  /** 布局坐标(百分比,相对牌阵容器),用于可视化预览与摆放动画 */
  x: number;
  y: number;
  /** 旋转角度(凯尔特十字第二张横置) */
  rotate?: number;
}

export type SpreadDifficulty = "入门" | "进阶" | "大师";

export interface TarotSpread {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  cardCount: number;
  /** 适用场景 */
  scenarios: string[];
  difficulty: SpreadDifficulty;
  /** 预计解读时长(分钟) */
  estimatedMinutes: number;
  positions: SpreadPosition[];
  /** 是否在首页热门牌阵展示 */
  featured?: boolean;
}

export const spreads: TarotSpread[] = [
  {
    id: "single",
    name: "单牌指引",
    nameEn: "Single Card",
    description: "一张牌,一个当下最需要听见的讯息。适合快速获得聚焦的指引。",
    cardCount: 1,
    scenarios: ["每日指引", "快速决策", "简单问题"],
    difficulty: "入门",
    estimatedMinutes: 3,
    featured: true,
    positions: [
      {
        index: 0,
        name: "指引",
        meaning: "此刻宇宙想让你听见的讯息",
        x: 50,
        y: 50,
      },
    ],
  },
  {
    id: "past-present-future",
    name: "时间之流",
    nameEn: "Past · Present · Future",
    description: "过去、现在、未来三张牌,梳理事情的来龙去脉与发展方向。",
    cardCount: 3,
    scenarios: ["事件走向", "关系发展", "阶段回顾"],
    difficulty: "入门",
    estimatedMinutes: 6,
    featured: true,
    positions: [
      {
        index: 0,
        name: "过去",
        meaning: "事情的根源与过往的影响",
        x: 20,
        y: 50,
      },
      { index: 1, name: "现在", meaning: "当下的能量与真实处境", x: 50, y: 50 },
      {
        index: 2,
        name: "未来",
        meaning: "维持现状时最可能的走向",
        x: 80,
        y: 50,
      },
    ],
  },
  {
    id: "situation-obstacle-advice",
    name: "破局之钥",
    nameEn: "Situation · Obstacle · Advice",
    description: "现状、阻碍、建议三张牌,直面问题核心,寻找突破口。",
    cardCount: 3,
    scenarios: ["困境分析", "寻求建议", "自我成长"],
    difficulty: "入门",
    estimatedMinutes: 6,
    positions: [
      { index: 0, name: "现状", meaning: "你所处局面的真实样貌", x: 20, y: 50 },
      { index: 1, name: "阻碍", meaning: "隐藏或明显的阻力所在", x: 50, y: 50 },
      { index: 2, name: "建议", meaning: "值得尝试的态度与行动", x: 80, y: 50 },
    ],
  },
  {
    id: "love-relationship",
    name: "月下之桥",
    nameEn: "Love Relationship",
    description: "你、对方、关系的联结与走向。四张牌照见一段感情里彼此的位置。",
    cardCount: 4,
    scenarios: ["恋爱关系", "暧昧试探", "复合考量"],
    difficulty: "进阶",
    estimatedMinutes: 10,
    featured: true,
    positions: [
      {
        index: 0,
        name: "你的状态",
        meaning: "你在这段关系中的心境与姿态",
        x: 22,
        y: 32,
      },
      {
        index: 1,
        name: "对方状态",
        meaning: "对方此刻的心境与态度",
        x: 78,
        y: 32,
      },
      {
        index: 2,
        name: "关系联结",
        meaning: "你们之间真实的联结质量",
        x: 50,
        y: 55,
      },
      {
        index: 3,
        name: "发展方向",
        meaning: "这段关系最可能的走向",
        x: 50,
        y: 84,
      },
    ],
  },
  {
    id: "career-choice",
    name: "岔路占卜",
    nameEn: "Career Choice",
    description:
      "现状、选择 A、选择 B、潜在因素与建议,帮你在职业岔路口看清两条路。",
    cardCount: 5,
    scenarios: ["职业抉择", "跳槽考量", "学业方向"],
    difficulty: "进阶",
    estimatedMinutes: 12,
    featured: true,
    positions: [
      {
        index: 0,
        name: "当前处境",
        meaning: "你在事业中的真实位置",
        x: 50,
        y: 82,
      },
      {
        index: 1,
        name: "道路 A",
        meaning: "第一个选择的能量与前景",
        x: 24,
        y: 44,
      },
      {
        index: 2,
        name: "道路 B",
        meaning: "第二个选择的能量与前景",
        x: 76,
        y: 44,
      },
      {
        index: 3,
        name: "潜在因素",
        meaning: "你尚未看见的关键变量",
        x: 50,
        y: 55,
      },
      { index: 4, name: "指引", meaning: "更贴近内心的方向建议", x: 50, y: 16 },
    ],
  },
  {
    id: "five-elements",
    name: "五元素牌阵",
    nameEn: "Five Elements",
    description: "火、水、风、土四元素加精神中心,全面扫描你当下的能量状态。",
    cardCount: 5,
    scenarios: ["能量检视", "自我探索", "身心平衡"],
    difficulty: "进阶",
    estimatedMinutes: 12,
    positions: [
      {
        index: 0,
        name: "火 · 行动",
        meaning: "你的动力、热情与行动力",
        x: 50,
        y: 14,
      },
      {
        index: 1,
        name: "水 · 情感",
        meaning: "你的情绪与感受之流",
        x: 82,
        y: 42,
      },
      {
        index: 2,
        name: "风 · 思绪",
        meaning: "你的思考方式与沟通",
        x: 68,
        y: 84,
      },
      {
        index: 3,
        name: "土 · 现实",
        meaning: "你的物质基础与身体状态",
        x: 32,
        y: 84,
      },
      {
        index: 4,
        name: "灵 · 中心",
        meaning: "整合一切的核心课题",
        x: 18,
        y: 42,
      },
    ],
  },
  {
    id: "celtic-cross",
    name: "凯尔特十字",
    nameEn: "Celtic Cross",
    description: "十张牌的经典大阵,从根源到结果,完整展开一个问题的全部维度。",
    cardCount: 10,
    scenarios: ["重大议题", "深度剖析", "复杂局面"],
    difficulty: "大师",
    estimatedMinutes: 25,
    featured: true,
    positions: [
      { index: 0, name: "现状", meaning: "问题的核心与当前能量", x: 34, y: 44 },
      {
        index: 1,
        name: "阻碍",
        meaning: "横亘在眼前的挑战",
        x: 34,
        y: 44,
        rotate: 90,
      },
      { index: 2, name: "根源", meaning: "问题在深处的起点", x: 34, y: 78 },
      { index: 3, name: "过去", meaning: "正在远去的影响", x: 12, y: 44 },
      { index: 4, name: "显意识", meaning: "你所期望或聚焦的", x: 34, y: 12 },
      { index: 5, name: "近未来", meaning: "即将进入的能量", x: 56, y: 44 },
      { index: 6, name: "自我", meaning: "你在此事中的姿态", x: 82, y: 82 },
      { index: 7, name: "环境", meaning: "他人与外界的影响", x: 82, y: 58 },
      {
        index: 8,
        name: "希望与恐惧",
        meaning: "内心深处的期待与担忧",
        x: 82,
        y: 34,
      },
      { index: 9, name: "结果", meaning: "当前轨迹下的最终走向", x: 82, y: 10 },
    ],
  },
];

export function getSpreadById(id: string): TarotSpread | undefined {
  return spreads.find((spread) => spread.id === id);
}

export const featuredSpreads = spreads.filter((spread) => spread.featured);
