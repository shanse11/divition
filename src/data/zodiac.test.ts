import { describe, expect, it } from "vitest";
import {
  getStableZodiacForecast,
  getZodiacByBirthDate,
  getZodiacByDate,
  normalizeForecastPeriod,
} from "@/data/zodiac";

describe("getZodiacByDate", () => {
  it.each([
    [3, 21, "aries"],
    [4, 20, "taurus"],
    [12, 31, "capricorn"],
    [1, 19, "capricorn"],
    [2, 19, "pisces"],
  ])("maps %i/%i to %s", (month, day, id) => {
    expect(getZodiacByDate(month, day).id).toBe(id);
  });
});

describe("getZodiacByBirthDate", () => {
  it("accepts a valid leap day", () => {
    expect(getZodiacByBirthDate("2024-02-29")).toMatchObject({ id: "pisces" });
  });

  it.each(["2025-02-29", "2026-04-31", "not-a-date", "2026-13-01"])(
    "rejects invalid calendar date %s",
    (value) => {
      expect(getZodiacByBirthDate(value)).toBeNull();
    },
  );
});

describe("normalizeForecastPeriod", () => {
  it.each(["today", "week", "month"] as const)("accepts %s", (period) => {
    expect(normalizeForecastPeriod(period)).toBe(period);
  });

  it("falls back to today", () => {
    expect(normalizeForecastPeriod("year")).toBe("today");
  });
});

describe("getStableZodiacForecast", () => {
  it("is stable for the same sign, period, and reference date", () => {
    expect(getStableZodiacForecast("leo", "week", "2026-07-20")).toEqual(
      getStableZodiacForecast("leo", "week", "2026-07-20"),
    );
  });

  it("uses the same seed throughout a calendar week", () => {
    expect(getStableZodiacForecast("leo", "week", "2026-07-20")).toEqual(
      getStableZodiacForecast("leo", "week", "2026-07-26"),
    );
  });

  it("changes monthly forecast after crossing a month boundary", () => {
    expect(getStableZodiacForecast("leo", "month", "2026-07-31")).not.toEqual(
      getStableZodiacForecast("leo", "month", "2026-08-01"),
    );
  });

  it("returns detailed scores within a sensible range", () => {
    const forecast = getStableZodiacForecast("pisces", "today", "2026-07-20");
    expect(forecast.overall).toBeGreaterThanOrEqual(60);
    expect(forecast.overall).toBeLessThanOrEqual(98);
    expect(Object.keys(forecast.scores)).toEqual([
      "love",
      "career",
      "wealth",
      "wellbeing",
    ]);
    expect(forecast.details.love.length).toBeGreaterThan(20);
  });
});
