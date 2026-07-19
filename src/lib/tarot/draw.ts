import { tarotDeck } from "@/data/tarot-cards";
import type { DrawnCard } from "@/types/tarot";

/** 使用 Web Crypto 生成 [0, max) 的无偏随机整数 */
export function secureRandomInt(max: number): number {
  if (max <= 0 || !Number.isInteger(max)) {
    throw new Error("max 必须为正整数");
  }
  const range = 0x100000000;
  const limit = range - (range % max);
  const buf = new Uint32Array(1);
  // 拒绝采样,避免模偏差
  for (;;) {
    crypto.getRandomValues(buf);
    if (buf[0] < limit) return buf[0] % max;
  }
}

/** Fisher–Yates 洗牌(不修改原数组) */
export function secureShuffle<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface DrawOptions {
  /** 逆位概率,默认 0.35 */
  reversalRate?: number;
}

/**
 * 从 78 张牌中安全抽取 count 张,不重复,每张独立判定正逆位。
 */
export function drawCards(count: number, options: DrawOptions = {}): DrawnCard[] {
  if (count < 1 || count > tarotDeck.length) {
    throw new Error(`抽牌数量必须在 1-${tarotDeck.length} 之间`);
  }
  const { reversalRate = 0.35 } = options;
  const shuffled = secureShuffle(tarotDeck);
  return shuffled.slice(0, count).map((card, positionIndex) => ({
    cardId: card.id,
    reversed: secureRandomInt(1000) < reversalRate * 1000,
    positionIndex,
  }));
}
