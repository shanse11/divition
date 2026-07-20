import { describe, expect, it } from "vitest";
import {
  resolveFavorite,
  resolveLatestNote,
} from "@/lib/reading-compatibility";

describe("reading normalized compatibility", () => {
  it("prefers a normalized favorite while retaining the legacy flag as fallback", () => {
    expect(resolveFavorite(true, [])).toBe(true);
    expect(resolveFavorite(false, [{ id: "favorite_1" }])).toBe(true);
    expect(resolveFavorite(true, [{ id: "favorite_1" }])).toBe(true);
    expect(resolveFavorite(false, [])).toBe(false);
  });

  it("prefers the latest normalized note while retaining legacy text as fallback", () => {
    expect(resolveLatestNote("legacy note", [])).toBe("legacy note");
    expect(
      resolveLatestNote("legacy note", [
        { content: "older", updatedAt: new Date("2026-07-19T00:00:00Z") },
        { content: "newest", updatedAt: new Date("2026-07-20T00:00:00Z") },
      ]),
    ).toBe("newest");
    expect(
      resolveLatestNote("legacy note", [
        { content: "", updatedAt: new Date("2026-07-20T00:00:00Z") },
      ]),
    ).toBe("");
  });
});
