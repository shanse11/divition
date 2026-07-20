export const siteConfig = {
  name: "星语秘境",
  nameEn: "Astral Oracle",
  description:
    "AI 塔罗占卜、每日一牌、星座运势、解梦与关系指引。仅供娱乐与自我探索。",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;

export interface NavItem {
  title: string;
  href: string;
  description?: string;
}

export const mainNav: NavItem[] = [
  {
    title: "塔罗占卜",
    href: "/tarot",
    description: "洗牌、抽牌与 AI 深度解读",
  },
  { title: "每日一牌", href: "/daily", description: "今日之牌与运势提醒" },
  {
    title: "星座",
    href: "/zodiac",
    description: "十二星座今日、本周与本月运势",
  },
  { title: "解梦", href: "/dream", description: "记录梦境,倾听潜意识的低语" },
  { title: "关系", href: "/relationship", description: "感情与关系的多维洞察" },
  { title: "记录", href: "/history", description: "回顾走过的每一次占卜" },
] as const;
