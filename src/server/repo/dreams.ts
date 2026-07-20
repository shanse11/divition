import "server-only";
import { prisma } from "@/server/db";
import {
  buildDreamCreateData,
  parseDreamRecord,
  type DreamRecord,
} from "@/lib/dream-record";
import type { DreamInterpretation } from "@/lib/ai/schema";
import type { DreamInput, DreamUpdate } from "@/lib/validation/dream";

interface CreateDreamRecord {
  id: string;
  ownerId: string;
  userId: string | null;
  input: DreamInput;
  result: DreamInterpretation;
}

export const dreamsRepo = {
  async create(record: CreateDreamRecord): Promise<DreamRecord> {
    const row = await prisma.dreamReading.create({
      data: buildDreamCreateData(record),
    });
    return parseDreamRecord(row);
  },

  async findById(id: string): Promise<DreamRecord | null> {
    const row = await prisma.dreamReading.findUnique({ where: { id } });
    return row ? parseDreamRecord(row) : null;
  },

  async listByOwner(ownerIds: string[]): Promise<DreamRecord[]> {
    const rows = await prisma.dreamReading.findMany({
      where: { ownerId: { in: ownerIds } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return rows.map(parseDreamRecord);
  },

  async update(id: string, patch: DreamUpdate): Promise<DreamRecord> {
    const row = await prisma.dreamReading.update({
      where: { id },
      data: patch,
    });
    return parseDreamRecord(row);
  },

  async delete(id: string): Promise<void> {
    await prisma.dreamReading.delete({ where: { id } });
  },

  async claimByUser(anonId: string, userId: string): Promise<void> {
    await prisma.dreamReading.updateMany({
      where: { ownerId: anonId },
      data: { ownerId: userId, userId },
    });
  },
};
