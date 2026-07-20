import "server-only";
import type {
  AiConfig,
  AiMessage,
  AiProvider,
  CompleteOptions,
} from "@/lib/ai/provider";
import { logger } from "@/lib/logger";

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

/** OpenAI-compatible Chat Completions Provider,支持任意中转站 */
export class OpenAiCompatibleProvider implements AiProvider {
  readonly name = "openai-compatible";

  constructor(private readonly config: AiConfig) {}

  async complete(
    messages: AiMessage[],
    options: CompleteOptions = {},
  ): Promise<string> {
    const { baseUrl, apiKey, model, timeoutMs } = this.config;
    const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;

    const maxAttempts = 2;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(url, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: options.temperature ?? 0.8,
            max_tokens: options.maxTokens ?? 4000,
            ...(options.json
              ? { response_format: { type: "json_object" } }
              : {}),
          }),
        });

        if (!response.ok) {
          const status = response.status;
          // 4xx(除 429)无需重试
          const retriable = status === 429 || status >= 500;
          const text = await response.text().catch(() => "");
          logger.warn("ai.request_failed", {
            provider: this.name,
            status,
            attempt,
            // 不记录响应体全文,避免泄露
            bodyPreview: text.slice(0, 200),
          });
          if (!retriable || attempt === maxAttempts) {
            throw new Error(`AI 服务返回 ${status}`);
          }
          lastError = new Error(`AI 服务返回 ${status}`);
          continue;
        }

        const data = (await response.json()) as ChatCompletionResponse;
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error("AI 返回内容为空");
        }
        return content;
      } catch (error) {
        lastError = error;
        const aborted =
          error instanceof DOMException && error.name === "AbortError";
        logger.warn("ai.request_error", {
          provider: this.name,
          attempt,
          aborted,
          message: error instanceof Error ? error.message : "unknown",
        });
        if (attempt === maxAttempts) break;
      } finally {
        clearTimeout(timer);
      }
    }
    throw lastError instanceof Error ? lastError : new Error("AI 请求失败");
  }
}
