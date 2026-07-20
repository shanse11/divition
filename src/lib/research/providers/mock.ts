import "server-only";
import type { ResearchProvider } from "@/lib/research/provider";

/** 离线演示永远不伪造外部网页或来源。 */
export class MockResearchProvider implements ResearchProvider {
  readonly name = "mock" as const;
  async search(): Promise<never[]> {
    return [];
  }
}
