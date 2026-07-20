import { tarotDeck } from "@/data/tarot-cards";

function hashText(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export interface DailySelection {
  cardId: string;
  reversed: boolean;
}

/** 同一身份与日期始终返回相同牌面,用于每日一牌。 */
export function getStableDailyCard(
  ownerId: string,
  date: string,
): DailySelection {
  const seed = hashText(`${ownerId}:${date}:astral-oracle`);
  return {
    cardId: tarotDeck[seed % tarotDeck.length].id,
    reversed: (seed >>> 8) % 100 < 35,
  };
}

export interface CheckInStats {
  totalDays: number;
  currentStreak: number;
  longestStreak: number;
}

export interface CheckInCalendarDay {
  date: string;
  day: number;
  inMonth: boolean;
  checkedIn: boolean;
  isFuture: boolean;
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  threshold: number;
}

export function calculateCheckInStats(
  dates: string[],
  today: string,
): CheckInStats {
  const unique = [...new Set(dates)]
    .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date))
    .sort();
  let longestStreak = 0;
  let run = 0;
  for (let index = 0; index < unique.length; index += 1) {
    const previous =
      index > 0 ? Date.parse(`${unique[index - 1]}T00:00:00Z`) : NaN;
    const current = Date.parse(`${unique[index]}T00:00:00Z`);
    run = index > 0 && current - previous === 86_400_000 ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
  }
  let currentStreak = 0;
  const cursor = Date.parse(`${today}T00:00:00Z`);
  const latest = unique.at(-1);
  if (
    latest &&
    (cursor - Date.parse(`${latest}T00:00:00Z`) === 0 ||
      cursor - Date.parse(`${latest}T00:00:00Z`) === 86_400_000)
  ) {
    let expected = Date.parse(`${latest}T00:00:00Z`);
    for (let index = unique.length - 1; index >= 0; index -= 1) {
      if (Date.parse(`${unique[index]}T00:00:00Z`) !== expected) break;
      currentStreak += 1;
      expected -= 86_400_000;
    }
  }
  return { totalDays: unique.length, currentStreak, longestStreak };
}

export function buildMonthCheckInCalendar(
  year: number,
  month: number,
  dates: string[],
  today: string,
): CheckInCalendarDay[] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const startOffset = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const total = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const checked = new Set(dates);
  return Array.from({ length: total }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1, 1 - startOffset + index));
    const value = date.toISOString().slice(0, 10);
    return {
      date: value,
      day: date.getUTCDate(),
      inMonth: date.getUTCMonth() === month - 1,
      checkedIn: checked.has(value),
      isFuture: value > today,
    };
  });
}

export function resolveAchievements(
  definitions: AchievementDefinition[],
  stats: CheckInStats,
) {
  return definitions.map((achievement) => ({
    ...achievement,
    unlocked:
      achievement.id === "three-days" ||
      achievement.id === "seven-days" ||
      achievement.id === "thirty-days"
        ? stats.longestStreak >= achievement.threshold
        : stats.totalDays >= achievement.threshold,
  }));
}

export function buildDailyContent(cardId: string, reversed: boolean) {
  const card = tarotDeck.find((item) => item.id === cardId) ?? tarotDeck[0];
  const keywords = reversed ? card.reversedKeywords : card.uprightKeywords;
  return {
    keywords: keywords.slice(0, 3),
    love: `在人际与感情中,留意「${keywords[0]}」带来的提醒。先倾听,再表达。`,
    career: `今天适合围绕「${keywords[1] ?? keywords[0]}」调整节奏,把注意力放在可完成的一小步。`,
    wealth: "为冲动消费留出一晚的考虑时间,重要决定仍应依据可靠信息。",
    emotion: card.essence,
    advice: `把「${keywords[0]}」当作今日的自我觉察线索,而不是必须服从的预言。`,
    luckyColor: ["古金色", "月光银", "深海蓝", "雾紫色"][card.index % 4],
    luckyNumber: (card.index % 9) + 1,
    do: ["整理一处空间", "写下此刻的感受", "完成一件小事"],
    avoid: ["仓促下结论", "替他人做决定"],
  };
}
