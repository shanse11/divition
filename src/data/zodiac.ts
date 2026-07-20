export type ZodiacId =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export interface ZodiacSign {
  id: ZodiacId;
  name: string;
  nameEn: string;
  symbol: string;
  /** 元素:火/土/风/水 */
  element: "火" | "土" | "风" | "水";
  /** 日期区间,月/日 */
  start: [number, number];
  end: [number, number];
  dateLabel: string;
  traits: string[];
}

export const zodiacSigns: ZodiacSign[] = [
  {
    id: "aries",
    name: "白羊座",
    nameEn: "Aries",
    symbol: "♈",
    element: "火",
    start: [3, 21],
    end: [4, 19],
    dateLabel: "3.21 - 4.19",
    traits: ["热情", "果敢", "直率"],
  },
  {
    id: "taurus",
    name: "金牛座",
    nameEn: "Taurus",
    symbol: "♉",
    element: "土",
    start: [4, 20],
    end: [5, 20],
    dateLabel: "4.20 - 5.20",
    traits: ["稳重", "务实", "感官"],
  },
  {
    id: "gemini",
    name: "双子座",
    nameEn: "Gemini",
    symbol: "♊",
    element: "风",
    start: [5, 21],
    end: [6, 21],
    dateLabel: "5.21 - 6.21",
    traits: ["机敏", "好奇", "多变"],
  },
  {
    id: "cancer",
    name: "巨蟹座",
    nameEn: "Cancer",
    symbol: "♋",
    element: "水",
    start: [6, 22],
    end: [7, 22],
    dateLabel: "6.22 - 7.22",
    traits: ["温柔", "念旧", "守护"],
  },
  {
    id: "leo",
    name: "狮子座",
    nameEn: "Leo",
    symbol: "♌",
    element: "火",
    start: [7, 23],
    end: [8, 22],
    dateLabel: "7.23 - 8.22",
    traits: ["自信", "慷慨", "光芒"],
  },
  {
    id: "virgo",
    name: "处女座",
    nameEn: "Virgo",
    symbol: "♍",
    element: "土",
    start: [8, 23],
    end: [9, 22],
    dateLabel: "8.23 - 9.22",
    traits: ["细致", "理性", "洞察"],
  },
  {
    id: "libra",
    name: "天秤座",
    nameEn: "Libra",
    symbol: "♎",
    element: "风",
    start: [9, 23],
    end: [10, 23],
    dateLabel: "9.23 - 10.23",
    traits: ["优雅", "平衡", "社交"],
  },
  {
    id: "scorpio",
    name: "天蝎座",
    nameEn: "Scorpio",
    symbol: "♏",
    element: "水",
    start: [10, 24],
    end: [11, 22],
    dateLabel: "10.24 - 11.22",
    traits: ["深刻", "专注", "蜕变"],
  },
  {
    id: "sagittarius",
    name: "射手座",
    nameEn: "Sagittarius",
    symbol: "♐",
    element: "火",
    start: [11, 23],
    end: [12, 21],
    dateLabel: "11.23 - 12.21",
    traits: ["自由", "乐观", "远方"],
  },
  {
    id: "capricorn",
    name: "摩羯座",
    nameEn: "Capricorn",
    symbol: "♑",
    element: "土",
    start: [12, 22],
    end: [1, 19],
    dateLabel: "12.22 - 1.19",
    traits: ["坚韧", "自律", "攀登"],
  },
  {
    id: "aquarius",
    name: "水瓶座",
    nameEn: "Aquarius",
    symbol: "♒",
    element: "风",
    start: [1, 20],
    end: [2, 18],
    dateLabel: "1.20 - 2.18",
    traits: ["独立", "创新", "理想"],
  },
  {
    id: "pisces",
    name: "双鱼座",
    nameEn: "Pisces",
    symbol: "♓",
    element: "水",
    start: [2, 19],
    end: [3, 20],
    dateLabel: "2.19 - 3.20",
    traits: ["浪漫", "共情", "梦境"],
  },
];

export function getZodiacById(id: string): ZodiacSign | undefined {
  return zodiacSigns.find((sign) => sign.id === id);
}

export type ForecastPeriod = "today" | "week" | "month";

export interface ZodiacForecast {
  period: ForecastPeriod;
  overall: number;
  scores: { love: number; career: number; wealth: number; wellbeing: number };
  headline: string;
  details: { love: string; career: string; wealth: string; wellbeing: string };
  lucky: { color: string; number: number; direction: string };
}

function hashText(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1)
    hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  return hash >>> 0;
}

export function getZodiacByBirthDate(value: string): ZodiacSign | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    return null;
  return getZodiacByDate(month, day);
}

export function normalizeForecastPeriod(
  value: string | undefined,
): ForecastPeriod {
  return value === "week" || value === "month" ? value : "today";
}

export function getStableZodiacForecast(
  signId: ZodiacId,
  period: ForecastPeriod,
  referenceDate: string,
): ZodiacForecast {
  const date = new Date(`${referenceDate}T00:00:00Z`);
  const validDate = Number.isNaN(date.getTime())
    ? new Date("2026-01-01T00:00:00Z")
    : date;
  const weekDate = new Date(validDate);
  weekDate.setUTCDate(
    validDate.getUTCDate() - ((validDate.getUTCDay() + 6) % 7),
  );
  const key =
    period === "today"
      ? referenceDate
      : period === "week"
        ? weekDate.toISOString().slice(0, 10)
        : `${validDate.getUTCFullYear()}-${validDate.getUTCMonth() + 1}`;
  const seed = hashText(`${signId}:${period}:${key}:astral-forecast`);
  const score = (offset: number) => 62 + ((seed >>> offset) % 35);
  const scores = {
    love: score(1),
    career: score(7),
    wealth: score(13),
    wellbeing: score(19),
  };
  const sign = getZodiacById(signId) ?? zodiacSigns[0];
  const themes =
    period === "today" ? "今天" : period === "week" ? "本周" : "本月";
  return {
    period,
    overall: Math.round(
      (scores.love + scores.career + scores.wealth + scores.wellbeing) / 4,
    ),
    scores,
    headline: `${themes}，${sign.traits[0]}是你的星光关键词。`,
    details: {
      love: `${themes}在人际与感情中，温柔表达比猜测更有力量。围绕「${sign.traits[1]}」建立清晰边界，也给彼此留下呼吸的空间。`,
      career: `${themes}适合把灵感落成具体步骤。你的「${sign.traits[0]}」能推动进度，但记得用一个可执行的优先级收束注意力。`,
      wealth: `${themes}财务节奏宜稳不宜急。先确认长期价值，再决定是否投入时间或金钱。`,
      wellbeing: `${themes}请为身体和情绪留出恢复时间。短暂离开屏幕、散步或整理空间，都能让直觉重新变得清晰。`,
    },
    lucky: {
      color: ["古金色", "月光银", "深海蓝", "雾紫色"][seed % 4],
      number: (seed % 9) + 1,
      direction: ["东南", "正北", "西南", "正东"][seed % 4],
    },
  };
}

/** 根据出生月日判断太阳星座(娱乐向,不含星盘计算) */
export function getZodiacByDate(month: number, day: number): ZodiacSign {
  for (const sign of zodiacSigns) {
    const [sm, sd] = sign.start;
    const [em, ed] = sign.end;
    if (sm <= em) {
      if ((month === sm && day >= sd) || (month === em && day <= ed)) {
        return sign;
      }
      if (month > sm && month < em) return sign;
    } else {
      // 跨年区间(摩羯座)
      if ((month === sm && day >= sd) || (month === em && day <= ed)) {
        return sign;
      }
    }
  }
  // 理论上不会到达,兜底返回摩羯座
  return zodiacSigns[9];
}
