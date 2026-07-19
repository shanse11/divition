import { z } from "zod";
import { spreads } from "@/data/spreads";
import { tarotDeck } from "@/data/tarot-cards";

const cardIds = new Set(tarotDeck.map((c) => c.id));
const spreadIds = new Set(spreads.map((s) => s.id));

export const drawnCardSchema = z.object({
  cardId: z.string().refine((id) => cardIds.has(id), "未知的卡牌"),
  reversed: z.boolean(),
  positionIndex: z.number().int().min(0).max(9),
});

export const createReadingSchema = z
  .object({
    kind: z.enum(["tarot", "relationship"]).default("tarot"),
    category: z.enum([
      "general",
      "love",
      "career",
      "wealth",
      "social",
      "growth",
      "yesno",
      "custom",
    ]),
    question: z.string().trim().max(200).default(""),
    spreadId: z.string().refine((id) => spreadIds.has(id), "未知的牌阵"),
    style: z.enum(["gentle", "rational", "poetic", "direct", "brief", "deep"]),
    cards: z.array(drawnCardSchema).min(1).max(10),
  })
  .superRefine((data, ctx) => {
    const spread = spreads.find((s) => s.id === data.spreadId);
    if (spread && data.cards.length !== spread.cardCount) {
      ctx.addIssue({
        code: "custom",
        message: "抽牌数量与牌阵不符",
        path: ["cards"],
      });
    }
    const ids = new Set(data.cards.map((c) => c.cardId));
    if (ids.size !== data.cards.length) {
      ctx.addIssue({
        code: "custom",
        message: "同一次占卜不能包含重复卡牌",
        path: ["cards"],
      });
    }
    const positions = new Set(data.cards.map((c) => c.positionIndex));
    if (positions.size !== data.cards.length) {
      ctx.addIssue({
        code: "custom",
        message: "牌位索引重复",
        path: ["cards"],
      });
    }
  });

export type CreateReadingInput = z.infer<typeof createReadingSchema>;

export const updateReadingSchema = z.object({
  favorite: z.boolean().optional(),
  note: z.string().trim().max(2000).optional(),
});
