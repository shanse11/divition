import { describe, expect, it } from "vitest";
import type { DreamInterpretation } from "@/lib/ai/schema";
import { buildDreamCreateData, parseDreamRecord } from "@/lib/dream-record";
import type { DreamInput } from "@/lib/validation/dream";

const input: DreamInput = {
  content: "我梦见自己走进一座有很多房间的旧房子。",
  when: "凌晨",
  emotion: "好奇",
  recurring: false,
  people: "",
  objects: "旧钟",
  scene: "旧房子",
  feeling: "平静",
  title: "旧房间",
  note: "醒来后补记",
};

const result: DreamInterpretation = {
  theme: "房屋与内心空间",
  keyImages: [{ image: "房屋", meaning: "可能对应内心空间" }],
  psychologicalMapping: "一段心理映射",
  emotionalState: "一段情绪观察",
  lifeConnection: "一段现实联系",
  selfInquiry: ["哪个房间最吸引你?"],
  gentleAdvice: "记录最近的变化。",
  uncertaintyNote: "仅供自我反思。",
};

describe("dream persistence helpers", () => {
  it("serializes validated input and interpretation without losing metadata", () => {
    const data = buildDreamCreateData({
      id: "dream_1",
      ownerId: "anon_1",
      userId: null,
      input,
      result,
    });

    expect(data).toEqual({
      id: "dream_1",
      ownerId: "anon_1",
      userId: null,
      input: JSON.stringify(input),
      result: JSON.stringify(result),
      title: "旧房间",
      note: "醒来后补记",
    });
  });

  it("parses a stored row into a safe public record", () => {
    const createdAt = new Date("2026-07-20T01:00:00.000Z");
    const updatedAt = new Date("2026-07-20T02:00:00.000Z");
    const record = parseDreamRecord({
      id: "dream_1",
      ownerId: "anon_1",
      input: JSON.stringify(input),
      result: JSON.stringify(result),
      title: "旧房间",
      note: "醒来后补记",
      favorite: true,
      createdAt,
      updatedAt,
    });

    expect(record).toMatchObject({
      id: "dream_1",
      ownerId: "anon_1",
      input,
      result,
      title: "旧房间",
      note: "醒来后补记",
      favorite: true,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    });
  });

  it("rejects corrupt persisted JSON instead of trusting it", () => {
    expect(() =>
      parseDreamRecord({
        id: "dream_bad",
        ownerId: "anon_1",
        input: "{}",
        result: "not-json",
        title: "",
        note: "",
        favorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).toThrow("Invalid persisted dream record");
  });
});
