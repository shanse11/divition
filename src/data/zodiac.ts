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
  { id: "aries", name: "白羊座", nameEn: "Aries", symbol: "♈", element: "火", start: [3, 21], end: [4, 19], dateLabel: "3.21 - 4.19", traits: ["热情", "果敢", "直率"] },
  { id: "taurus", name: "金牛座", nameEn: "Taurus", symbol: "♉", element: "土", start: [4, 20], end: [5, 20], dateLabel: "4.20 - 5.20", traits: ["稳重", "务实", "感官"] },
  { id: "gemini", name: "双子座", nameEn: "Gemini", symbol: "♊", element: "风", start: [5, 21], end: [6, 21], dateLabel: "5.21 - 6.21", traits: ["机敏", "好奇", "多变"] },
  { id: "cancer", name: "巨蟹座", nameEn: "Cancer", symbol: "♋", element: "水", start: [6, 22], end: [7, 22], dateLabel: "6.22 - 7.22", traits: ["温柔", "念旧", "守护"] },
  { id: "leo", name: "狮子座", nameEn: "Leo", symbol: "♌", element: "火", start: [7, 23], end: [8, 22], dateLabel: "7.23 - 8.22", traits: ["自信", "慷慨", "光芒"] },
  { id: "virgo", name: "处女座", nameEn: "Virgo", symbol: "♍", element: "土", start: [8, 23], end: [9, 22], dateLabel: "8.23 - 9.22", traits: ["细致", "理性", "洞察"] },
  { id: "libra", name: "天秤座", nameEn: "Libra", symbol: "♎", element: "风", start: [9, 23], end: [10, 23], dateLabel: "9.23 - 10.23", traits: ["优雅", "平衡", "社交"] },
  { id: "scorpio", name: "天蝎座", nameEn: "Scorpio", symbol: "♏", element: "水", start: [10, 24], end: [11, 22], dateLabel: "10.24 - 11.22", traits: ["深刻", "专注", "蜕变"] },
  { id: "sagittarius", name: "射手座", nameEn: "Sagittarius", symbol: "♐", element: "火", start: [11, 23], end: [12, 21], dateLabel: "11.23 - 12.21", traits: ["自由", "乐观", "远方"] },
  { id: "capricorn", name: "摩羯座", nameEn: "Capricorn", symbol: "♑", element: "土", start: [12, 22], end: [1, 19], dateLabel: "12.22 - 1.19", traits: ["坚韧", "自律", "攀登"] },
  { id: "aquarius", name: "水瓶座", nameEn: "Aquarius", symbol: "♒", element: "风", start: [1, 20], end: [2, 18], dateLabel: "1.20 - 2.18", traits: ["独立", "创新", "理想"] },
  { id: "pisces", name: "双鱼座", nameEn: "Pisces", symbol: "♓", element: "水", start: [2, 19], end: [3, 20], dateLabel: "2.19 - 3.20", traits: ["浪漫", "共情", "梦境"] },
];

export function getZodiacById(id: string): ZodiacSign | undefined {
  return zodiacSigns.find((sign) => sign.id === id);
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
