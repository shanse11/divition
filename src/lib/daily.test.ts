import { describe, expect, it } from "vitest";
import {
  buildMonthCheckInCalendar,
  calculateCheckInStats,
  getStableDailyCard,
  resolveAchievements,
} from "@/lib/daily";

describe("getStableDailyCard", () => {
  it("is stable for the same owner and date", () => {
    expect(getStableDailyCard("anon_test", "2026-07-20")).toEqual(
      getStableDailyCard("anon_test", "2026-07-20"),
    );
  });

  it("returns a valid orientation", () => {
    expect(typeof getStableDailyCard("user_test", "2026-07-20").reversed).toBe(
      "boolean",
    );
  });
});

describe("calculateCheckInStats", () => {
  it("deduplicates dates and calculates current and longest streaks", () => {
    expect(
      calculateCheckInStats(
        [
          "2026-07-20",
          "2026-07-19",
          "2026-07-19",
          "2026-07-18",
          "2026-07-15",
          "2026-07-14",
        ],
        "2026-07-20",
      ),
    ).toEqual({ totalDays: 5, currentStreak: 3, longestStreak: 3 });
  });

  it("keeps a streak alive when the latest check-in was yesterday", () => {
    expect(
      calculateCheckInStats(["2026-07-18", "2026-07-19"], "2026-07-20")
        .currentStreak,
    ).toBe(2);
  });

  it("returns zero current streak when the latest check-in is older", () => {
    expect(
      calculateCheckInStats(["2026-07-17", "2026-07-18"], "2026-07-20")
        .currentStreak,
    ).toBe(0);
  });
});

describe("buildMonthCheckInCalendar", () => {
  it("builds a Monday-first month grid with checked and future states", () => {
    const days = buildMonthCheckInCalendar(
      2026,
      7,
      ["2026-07-01", "2026-07-20"],
      "2026-07-20",
    );

    expect(days).toHaveLength(35);
    expect(days[0]).toMatchObject({ date: "2026-06-29", inMonth: false });
    expect(days.find((day) => day.date === "2026-07-01")).toMatchObject({
      checkedIn: true,
      isFuture: false,
    });
    expect(days.find((day) => day.date === "2026-07-21")?.isFuture).toBe(true);
  });
});

describe("resolveAchievements", () => {
  it("unlocks database-backed definitions from check-in stats", () => {
    const achievements = resolveAchievements(
      [
        {
          id: "first-light",
          name: "初见星光",
          description: "完成第一次每日一牌",
          icon: "sparkles",
          threshold: 1,
        },
        {
          id: "seven-days",
          name: "七日星轨",
          description: "连续七天查看每日一牌",
          icon: "calendar",
          threshold: 7,
        },
      ],
      { totalDays: 9, currentStreak: 7, longestStreak: 7 },
    );

    expect(achievements.map(({ id, unlocked }) => ({ id, unlocked }))).toEqual([
      { id: "first-light", unlocked: true },
      { id: "seven-days", unlocked: true },
    ]);
  });
});
