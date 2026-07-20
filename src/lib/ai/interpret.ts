import "server-only";
import { loadAiConfig, type AiProvider } from "@/lib/ai/provider";
import { MockProvider } from "@/lib/ai/providers/mock";
import { OpenAiCompatibleProvider } from "@/lib/ai/providers/openai-compatible";
import {
  buildDreamSystemPrompt,
  buildDreamUserPrompt,
  buildTarotSystemPrompt,
  buildTarotUserPrompt,
  type TarotPromptInput,
} from "@/lib/ai/prompts";
import {
  dreamInterpretationSchema,
  interpretationSchema,
  type DreamInterpretation,
} from "@/lib/ai/schema";
import {
  DISCLAIMER,
  generateLocalInterpretation,
} from "@/lib/interpretation/local";
import { generateLocalDreamReading } from "@/lib/interpretation/local-dream";
import { logger } from "@/lib/logger";
import { researchQuestion } from "@/lib/research/service";
import type { Interpretation } from "@/types/reading";
import type { DreamInput } from "@/lib/validation/dream";

let cachedProvider: AiProvider | null = null;

export function getAiProvider(): AiProvider {
  if (cachedProvider) return cachedProvider;
  const config = loadAiConfig();
  cachedProvider =
    config.provider === "openai-compatible"
      ? new OpenAiCompatibleProvider(config)
      : new MockProvider();
  logger.info("ai.provider_selected", { provider: cachedProvider.name });
  return cachedProvider;
}

/** 提取模型输出中的 JSON(容忍 ```json 包裹等情况) */
function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  return JSON.parse(unfenced);
}

/**
 * 生成塔罗解读。
 * Mock Provider 或 AI 输出异常时,自动降级为本地解读引擎。
 */
export async function interpretTarot(
  input: TarotPromptInput,
): Promise<{ interpretation: Interpretation; source: "ai" | "local" }> {
  const provider = getAiProvider();
  const research = await researchQuestion(input.question);
  const enrichedInput = { ...input, research };

  if (provider.name === "mock") {
    return {
      interpretation: generateLocalInterpretation(enrichedInput),
      source: "local",
    };
  }

  try {
    const raw = await provider.complete(
      [
        { role: "system", content: buildTarotSystemPrompt() },
        { role: "user", content: buildTarotUserPrompt(enrichedInput) },
      ],
      { json: true },
    );
    const parsed = interpretationSchema.safeParse(extractJson(raw));
    if (!parsed.success) {
      logger.warn("ai.tarot_schema_mismatch", {
        issues: parsed.error.issues.length,
      });
      return {
        interpretation: generateLocalInterpretation(enrichedInput),
        source: "local",
      };
    }
    // 免责声明始终使用站方文案,避免模型改写
    return {
      interpretation: { ...parsed.data, research, disclaimer: DISCLAIMER },
      source: "ai",
    };
  } catch (error) {
    logger.error("ai.tarot_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return {
      interpretation: generateLocalInterpretation(enrichedInput),
      source: "local",
    };
  }
}

/** 生成解梦结果,失败时降级本地模板 */
export async function interpretDream(
  input: DreamInput,
): Promise<{ result: DreamInterpretation; source: "ai" | "local" }> {
  const provider = getAiProvider();

  if (provider.name === "mock") {
    return { result: generateLocalDreamReading(input), source: "local" };
  }

  try {
    const raw = await provider.complete(
      [
        { role: "system", content: buildDreamSystemPrompt() },
        { role: "user", content: buildDreamUserPrompt(input) },
      ],
      { json: true },
    );
    const parsed = dreamInterpretationSchema.safeParse(extractJson(raw));
    if (!parsed.success) {
      logger.warn("ai.dream_schema_mismatch", {
        issues: parsed.error.issues.length,
      });
      return { result: generateLocalDreamReading(input), source: "local" };
    }
    return { result: parsed.data, source: "ai" };
  } catch (error) {
    logger.error("ai.dream_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return { result: generateLocalDreamReading(input), source: "local" };
  }
}
