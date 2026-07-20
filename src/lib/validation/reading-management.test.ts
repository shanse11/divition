import { describe, expect, it } from "vitest";
import {
  bulkReadingsSchema,
  readingQuerySchema,
} from "@/lib/validation/reading-management";

describe("readingQuerySchema", () => {
  it("parses supported history filters and caps the page size", () => {
    const parsed = readingQuerySchema.parse({
      q: "  星星  ",
      kind: "relationship",
      favorite: "true",
      from: "2026-07-01",
      to: "2026-07-20",
      cursor: "reading_1",
      limit: "999",
    });

    expect(parsed).toEqual({
      q: "星星",
      kind: "relationship",
      favorite: true,
      from: new Date("2026-07-01T00:00:00.000Z"),
      to: new Date("2026-07-20T23:59:59.999Z"),
      cursor: "reading_1",
      limit: 50,
    });
  });

  it("rejects reversed date ranges and unsupported filters", () => {
    expect(
      readingQuerySchema.safeParse({ from: "2026-07-20", to: "2026-07-01" })
        .success,
    ).toBe(false);
    expect(readingQuerySchema.safeParse({ favorite: "yes" }).success).toBe(
      false,
    );
    expect(readingQuerySchema.safeParse({ kind: "dream" }).success).toBe(false);
  });
});

describe("bulkReadingsSchema", () => {
  it("accepts bounded unique ids and all supported actions", () => {
    for (const action of [
      "delete",
      "favorite",
      "unfavorite",
      "export",
    ] as const) {
      expect(
        bulkReadingsSchema.parse({ action, ids: ["reading_1", "reading_2"] }),
      ).toEqual({ action, ids: ["reading_1", "reading_2"] });
    }
  });

  it("rejects duplicate, empty, and oversized id sets", () => {
    expect(
      bulkReadingsSchema.safeParse({ action: "delete", ids: ["same", "same"] })
        .success,
    ).toBe(false);
    expect(
      bulkReadingsSchema.safeParse({ action: "delete", ids: [] }).success,
    ).toBe(false);
    expect(
      bulkReadingsSchema.safeParse({
        action: "delete",
        ids: Array.from({ length: 51 }, (_, index) => `id_${index}`),
      }).success,
    ).toBe(false);
  });
});
