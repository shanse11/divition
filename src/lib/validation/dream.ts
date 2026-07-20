import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().default("");

export const dreamInputSchema = z
  .object({
    content: z
      .string()
      .trim()
      .min(10, "请至少描述 10 个字的梦境内容")
      .max(2000),
    when: optionalText(50),
    emotion: optionalText(50),
    recurring: z.boolean().optional().default(false),
    people: optionalText(100),
    objects: optionalText(100),
    scene: optionalText(100),
    feeling: optionalText(100),
    title: optionalText(100),
    note: optionalText(1000),
  })
  .strict();

export const dreamUpdateSchema = z
  .object({
    title: z.string().trim().max(100).optional(),
    note: z.string().trim().max(1000).optional(),
    favorite: z.boolean().optional(),
  })
  .strict()
  .refine(
    (patch) => Object.values(patch).some((value) => value !== undefined),
    {
      message: "请至少提供一个要更新的字段",
    },
  );

export type DreamInput = z.infer<typeof dreamInputSchema>;
export type DreamUpdate = z.infer<typeof dreamUpdateSchema>;
