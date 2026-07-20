import "server-only";
import type { AiMessage, AiProvider } from "@/lib/ai/provider";

/**
 * Mock Provider:不访问网络。
 * 它并不真正理解 prompt,而是返回一个「标记」,
 * 由调用方(interpret.ts)检测到 mock 时直接使用本地解读引擎。
 * 这样保证无 API Key 时全功能可演示,且输出质量可控。
 */
export class MockProvider implements AiProvider {
  readonly name = "mock";

  async complete(messages: AiMessage[]): Promise<string> {
    void messages;
    // 模拟少量延迟,让加载动画自然呈现
    await new Promise((resolve) => setTimeout(resolve, 400));
    return JSON.stringify({ __mock: true });
  }
}
