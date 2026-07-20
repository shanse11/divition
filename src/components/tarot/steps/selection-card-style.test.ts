import { describe, expect, it } from "vitest";
import { getSelectionCardClassName } from "@/components/tarot/steps/selection-card-style";

describe("getSelectionCardClassName", () => {
  it("adds an unmistakable ring and stronger background when selected", () => {
    const className = getSelectionCardClassName(true);
    expect(className).toContain("ring-2");
    expect(className).toContain("border-[#f2da9c]");
    expect(className).toContain("bg-[rgba(215,180,106,0.18)]");
  });

  it("does not add selected treatment when unselected", () => {
    expect(getSelectionCardClassName(false)).not.toContain("ring-2");
  });
});
