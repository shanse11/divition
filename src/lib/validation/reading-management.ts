import { z } from "zod";

const HISTORY_LIMIT_DEFAULT = 20;
export const HISTORY_LIMIT_MAX = 50;
export const BULK_READING_LIMIT = 50;

const optionalText = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().max(200).optional(),
);

const dateBoundary = (endOfDay: boolean) =>
  z.preprocess((value) => {
    if (value === undefined || value === "") return undefined;
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    return new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`);
  }, z.date().optional());

export const readingQuerySchema = z
  .object({
    q: optionalText,
    kind: z.enum(["tarot", "relationship"]).optional(),
    favorite: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
    from: dateBoundary(false),
    to: dateBoundary(true),
    cursor: optionalText,
    limit: z.coerce
      .number()
      .int()
      .positive()
      .default(HISTORY_LIMIT_DEFAULT)
      .transform((value) => Math.min(value, HISTORY_LIMIT_MAX)),
  })
  .strict()
  .refine(({ from, to }) => !from || !to || from.getTime() <= to.getTime(), {
    message: "开始日期不能晚于结束日期",
    path: ["to"],
  });

export type ReadingQuery = z.infer<typeof readingQuerySchema>;

export const bulkReadingsSchema = z
  .object({
    action: z.enum(["delete", "favorite", "unfavorite", "export"]),
    ids: z
      .array(z.string().trim().min(1).max(100))
      .min(1)
      .max(BULK_READING_LIMIT),
  })
  .strict()
  .refine(({ ids }) => new Set(ids).size === ids.length, {
    message: "记录 ID 不能重复",
    path: ["ids"],
  });

export type BulkReadingsInput = z.infer<typeof bulkReadingsSchema>;

export const favoriteReadingSchema = z
  .object({ favorite: z.boolean() })
  .strict();

export const noteReadingSchema = z
  .object({ note: z.string().trim().max(2000) })
  .strict();
