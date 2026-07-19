import "server-only";
import type { ReadingRecord } from "@/types/reading";

/**
 * 占卜记录仓库接口。
 * 当前为内存实现,阶段5将替换为 Prisma 实现,接口保持不变。
 */
export interface ReadingsRepo {
  create(record: ReadingRecord & { ownerId: string }): Promise<void>;
  findById(id: string): Promise<(ReadingRecord & { ownerId: string }) | null>;
  listByOwner(ownerId: string): Promise<Array<ReadingRecord & { ownerId: string }>>;
  update(
    id: string,
    patch: Partial<Pick<ReadingRecord, "favorite" | "note" | "interpretation">>,
  ): Promise<void>;
  delete(id: string): Promise<void>;
}

// 存放在 globalThis 上,避免 dev 模式下不同入口 bundle 各持有一份模块实例
const globalStore = globalThis as unknown as {
  __astralReadings?: Map<string, ReadingRecord & { ownerId: string }>;
};
const memory = (globalStore.__astralReadings ??= new Map());

export const readingsRepo: ReadingsRepo = {
  async create(record) {
    memory.set(record.id, record);
  },
  async findById(id) {
    return memory.get(id) ?? null;
  },
  async listByOwner(ownerId) {
    return [...memory.values()]
      .filter((r) => r.ownerId === ownerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async update(id, patch) {
    const existing = memory.get(id);
    if (existing) memory.set(id, { ...existing, ...patch });
  },
  async delete(id) {
    memory.delete(id);
  },
};
