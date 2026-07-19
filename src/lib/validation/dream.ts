import { z } from "zod";

export const dreamInputSchema = z.object({
  content: z.string().trim().min(10, "请至少描述 10 个字的梦境内容").max(2000),
  when: z.string().trim().max(50).optional().default(""),
  emotion: z.string().trim().max(50).optional().default(""),
  recurring: z.boolean().optional().default(false),
  people: z.string().trim().max(100).optional().default(""),
  objects: z.string().trim().max(100).optional().default(""),
  scene: z.string().trim().max(100).optional().default(""),
  feeling: z.string().trim().max(100).optional().default(""),
});

export type DreamInput = z.infer<typeof dreamInputSchema>;
