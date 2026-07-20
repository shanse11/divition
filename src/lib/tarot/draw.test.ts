import { describe, expect, it, vi } from "vitest";
import { drawCards } from "@/lib/tarot/draw";

function installCrypto(values: number[]) {
  let index = 0;
  vi.stubGlobal("crypto", {
    getRandomValues(array: Uint32Array) {
      array[0] = values[index % values.length] ?? index;
      index += 1;
      return array;
    },
  });
}

describe("drawCards", () => {
  it("draws unique cards with mapped positions", () => {
    installCrypto(Array.from({ length: 100 }, (_, index) => index * 7919));
    const cards = drawCards(10);
    expect(new Set(cards.map((card) => card.cardId)).size).toBe(10);
    expect(cards.map((card) => card.positionIndex)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);
  });
  it("generates upright and reversed values from the configured rate", () => {
    installCrypto([0]);
    expect(drawCards(1, { reversalRate: 1 })[0].reversed).toBe(true);
    expect(drawCards(1, { reversalRate: 0 })[0].reversed).toBe(false);
  });
});
