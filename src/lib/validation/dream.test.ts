import { describe, expect, it } from "vitest";
import { dreamInputSchema, dreamUpdateSchema } from "@/lib/validation/dream";

describe("dreamInputSchema", () => {
  it("normalizes a complete dream journal entry", () => {
    const parsed = dreamInputSchema.parse({
      content: "  我在一座被海水包围的旧屋里寻找出口。  ",
      when: "昨晚",
      emotion: "紧张",
      recurring: true,
      people: "童年好友",
      objects: "一把银色钥匙",
      scene: "暴雨中的海边旧屋",
      feeling: "醒来后仍然心跳很快",
      title: "海边的旧屋",
      note: "想留意最近关于搬家的焦虑",
    });

    expect(parsed).toEqual({
      content: "我在一座被海水包围的旧屋里寻找出口。",
      when: "昨晚",
      emotion: "紧张",
      recurring: true,
      people: "童年好友",
      objects: "一把银色钥匙",
      scene: "暴雨中的海边旧屋",
      feeling: "醒来后仍然心跳很快",
      title: "海边的旧屋",
      note: "想留意最近关于搬家的焦虑",
    });
  });

  it("fills optional journal fields with safe defaults", () => {
    const parsed = dreamInputSchema.parse({
      content: "我梦见自己在夜空中缓慢飞行。",
    });

    expect(parsed).toMatchObject({
      when: "",
      emotion: "",
      recurring: false,
      people: "",
      objects: "",
      scene: "",
      feeling: "",
      title: "",
      note: "",
    });
  });

  it("rejects unknown JSON fields", () => {
    expect(
      dreamInputSchema.safeParse({
        content: "我梦见自己走过一条很长的走廊。",
        privateToken: "do-not-store",
      }).success,
    ).toBe(false);
  });
});

describe("dreamUpdateSchema", () => {
  it("accepts editable metadata", () => {
    expect(
      dreamUpdateSchema.parse({
        title: "新的标题",
        note: "新的记录",
        favorite: true,
      }),
    ).toEqual({ title: "新的标题", note: "新的记录", favorite: true });
  });

  it("rejects empty and unknown patches", () => {
    expect(dreamUpdateSchema.safeParse({}).success).toBe(false);
    expect(dreamUpdateSchema.safeParse({ result: "tampered" }).success).toBe(
      false,
    );
  });
});
