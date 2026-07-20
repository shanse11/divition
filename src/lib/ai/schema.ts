import { z } from "zod";

/** AI 返回的结构化解读 Schema(与 Interpretation 类型对应) */
export const interpretationSchema = z.object({
  theme: z.string().min(1).max(200),
  overview: z.string().min(1).max(2000),
  cards: z
    .array(
      z.object({
        positionIndex: z.number().int().min(0).max(9),
        positionName: z.string().min(1).max(50),
        text: z.string().min(1).max(3000),
        keywords: z.array(z.string().max(20)).max(8),
      }),
    )
    .min(1)
    .max(10),
  connections: z.string().min(1).max(2000),
  situation: z.string().min(1).max(2000),
  obstacles: z.string().min(1).max(2000),
  advice: z.array(z.string().max(500)).min(1).max(6),
  signs: z.string().min(1).max(1000),
  summary: z.string().min(1).max(500),
  disclaimer: z.string().min(1).max(500),
});

/** 解梦结构化输出 Schema */
export const dreamInterpretationSchema = z.object({
  theme: z.string().min(1).max(200),
  keyImages: z
    .array(
      z.object({ image: z.string().max(50), meaning: z.string().max(500) }),
    )
    .min(1)
    .max(8),
  psychologicalMapping: z.string().min(1).max(2000),
  emotionalState: z.string().min(1).max(1000),
  lifeConnection: z.string().min(1).max(2000),
  selfInquiry: z.array(z.string().max(300)).min(1).max(5),
  gentleAdvice: z.string().min(1).max(1000),
  uncertaintyNote: z.string().min(1).max(500),
});

export type DreamInterpretation = z.infer<typeof dreamInterpretationSchema>;
