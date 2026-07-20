import { z } from "zod";

const safeHttpUrl = z
  .string()
  .url()
  .refine((value) => {
    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, "只允许 http/https 来源");

export const researchSchema = z.object({
  status: z.enum(["not_needed", "unavailable", "completed", "partial"]),
  asOfDate: z.string().date().nullable(),
  summary: z.string().max(1800),
  factStatus: z.enum(["past", "current", "future", "mixed"]),
  facts: z
    .array(
      z.object({
        claim: z.string().max(500),
        sourceIds: z.array(z.string().max(10)).max(4),
      }),
    )
    .max(8),
  decisionVariables: z.array(z.string().max(300)).max(8),
  uncertainties: z.array(z.string().max(500)).max(8),
  sources: z
    .array(
      z.object({
        id: z.string().regex(/^S[1-8]$/),
        title: z.string().max(300),
        url: safeHttpUrl,
        publisher: z.string().max(160),
        publishedAt: z.string().date().nullable(),
        tier: z.enum(["official", "primary", "reputable", "secondary"]),
        summary: z.string().max(1200),
      }),
    )
    .max(8),
});

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
  research: researchSchema.optional(),
  tarotPerspective: z.string().max(2000).optional(),
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
