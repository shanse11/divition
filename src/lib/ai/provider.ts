import "server-only";

/** AI Provider 的统一接口:输入消息,返回文本 */
export interface AiProvider {
  readonly name: string;
  /** 发送对话请求,返回模型文本输出(期望为 JSON 字符串) */
  complete(messages: AiMessage[], options?: CompleteOptions): Promise<string>;
}

export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CompleteOptions {
  /** 期望 JSON 输出 */
  json?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export interface AiConfig {
  provider: "mock" | "openai-compatible";
  baseUrl: string;
  apiKey: string;
  model: string;
  timeoutMs: number;
}

export function loadAiConfig(): AiConfig {
  const provider =
    process.env.AI_PROVIDER === "openai-compatible" && process.env.AI_API_KEY
      ? "openai-compatible"
      : "mock";
  return {
    provider,
    baseUrl: process.env.AI_BASE_URL ?? "https://api.openai.com/v1",
    apiKey: process.env.AI_API_KEY ?? "",
    model: process.env.AI_MODEL ?? "gpt-4o-mini",
    timeoutMs: Number(process.env.AI_TIMEOUT ?? 60_000) || 60_000,
  };
}
