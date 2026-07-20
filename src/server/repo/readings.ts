import "server-only";
import { prisma } from "@/server/db";
import {
  resolveFavorite,
  resolveLatestNote,
} from "@/lib/reading-compatibility";
import type { ReadingRecord } from "@/types/reading";
import type { DrawnCard, ReadingCategory, ReadingStyle } from "@/types/tarot";
import type { Interpretation, ReadingKind } from "@/types/reading";
import type { ReadingQuery } from "@/lib/validation/reading-management";

export type OwnedReading = ReadingRecord & { ownerId: string };

interface ReadingRow {
  id: string;
  ownerId: string;
  kind: string;
  category: string;
  question: string;
  spreadId: string;
  style: string;
  interpretation: string | null;
  favorite: boolean;
  note: string;
  createdAt: Date;
  draws: Array<{ cardId: string; reversed: boolean; positionIndex: number }>;
  favorites?: Array<{ id: string }>;
  notes?: Array<{ content: string; updatedAt: Date }>;
}

function rowToRecord(row: ReadingRow): OwnedReading {
  let interpretation: Interpretation | null = null;
  if (row.interpretation) {
    try {
      interpretation = JSON.parse(row.interpretation) as Interpretation;
    } catch {
      interpretation = null;
    }
  }
  return {
    id: row.id,
    ownerId: row.ownerId,
    kind: row.kind as ReadingKind,
    category: row.category as ReadingCategory,
    question: row.question,
    spreadId: row.spreadId,
    style: row.style as ReadingStyle,
    cards: row.draws
      .slice()
      .sort((a, b) => a.positionIndex - b.positionIndex)
      .map((draw): DrawnCard => ({
        cardId: draw.cardId,
        reversed: draw.reversed,
        positionIndex: draw.positionIndex,
      })),
    interpretation,
    favorite: resolveFavorite(row.favorite, row.favorites ?? []),
    note: resolveLatestNote(row.note, row.notes ?? []),
    createdAt: row.createdAt.toISOString(),
  };
}

const readingInclude = {
  draws: true,
  favorites: { where: { targetType: "reading" }, select: { id: true } },
  notes: {
    orderBy: { updatedAt: "desc" as const },
    take: 1,
    select: { content: true, updatedAt: true },
  },
};

export const readingsRepo = {
  async create(
    record: OwnedReading & { userId?: string | null },
  ): Promise<void> {
    await prisma.tarotReading.create({
      data: {
        id: record.id,
        ownerId: record.ownerId,
        userId: record.userId ?? null,
        kind: record.kind,
        category: record.category,
        question: record.question,
        spreadId: record.spreadId,
        style: record.style,
        interpretation: record.interpretation
          ? JSON.stringify(record.interpretation)
          : null,
        favorite: record.favorite,
        note: record.note,
        draws: {
          create: record.cards.map((card) => ({
            cardId: card.cardId,
            reversed: card.reversed,
            positionIndex: card.positionIndex,
          })),
        },
        ...(record.favorite
          ? {
              favorites: {
                create: {
                  ownerId: record.ownerId,
                  userId: record.userId ?? null,
                  targetType: "reading",
                  targetId: record.id,
                },
              },
            }
          : {}),
        ...(record.note ? { notes: { create: { content: record.note } } } : {}),
      },
    });
  },

  async findById(id: string): Promise<OwnedReading | null> {
    const row = await prisma.tarotReading.findUnique({
      where: { id },
      include: readingInclude,
    });
    return row ? rowToRecord(row) : null;
  },

  async listByOwner(
    ownerIds: string[],
    query?: ReadingQuery,
    includeLookahead = false,
  ): Promise<OwnedReading[]> {
    if (!ownerIds.length) return [];
    const and: Array<Record<string, unknown>> = [];
    if (query?.favorite === true) {
      and.push({
        OR: [
          { favorite: true },
          { favorites: { some: { targetType: "reading" } } },
        ],
      });
    } else if (query?.favorite === false) {
      and.push({
        AND: [
          { favorite: false },
          { favorites: { none: { targetType: "reading" } } },
        ],
      });
    }
    if (query?.q) {
      and.push({
        OR: [
          { question: { contains: query.q } },
          { interpretation: { contains: query.q } },
          { notes: { some: { content: { contains: query.q } } } },
        ],
      });
    }
    const rows = await prisma.tarotReading.findMany({
      where: {
        ownerId: { in: ownerIds },
        ...(query?.kind ? { kind: query.kind } : {}),
        ...(and.length ? { AND: and } : {}),
        ...(query?.from || query?.to
          ? {
              createdAt: {
                ...(query.from ? { gte: query.from } : {}),
                ...(query.to ? { lte: query.to } : {}),
              },
            }
          : {}),
      },
      ...(query?.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      include: readingInclude,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: (query?.limit ?? 20) + (includeLookahead ? 1 : 0),
    });
    return rows.map(rowToRecord);
  },

  async update(
    id: string,
    patch: Partial<Pick<ReadingRecord, "favorite" | "note">>,
    ownerIds?: string[],
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const reading = await tx.tarotReading.findFirst({
        where: { id, ...(ownerIds ? { ownerId: { in: ownerIds } } : {}) },
      });
      if (!reading) throw new Error("READING_NOT_FOUND");
      if (patch.favorite !== undefined) {
        if (patch.favorite) {
          await tx.favorite.upsert({
            where: {
              ownerId_targetType_targetId: {
                ownerId: reading.ownerId,
                targetType: "reading",
                targetId: id,
              },
            },
            update: { userId: reading.userId, readingId: id },
            create: {
              ownerId: reading.ownerId,
              userId: reading.userId,
              readingId: id,
              targetType: "reading",
              targetId: id,
            },
          });
        } else {
          await tx.favorite.deleteMany({
            where: {
              ownerId: reading.ownerId,
              targetType: "reading",
              targetId: id,
            },
          });
        }
        await tx.tarotReading.update({
          where: { id },
          data: { favorite: patch.favorite },
        });
      }
      if (patch.note !== undefined) {
        await tx.readingNote.upsert({
          where: { readingId: id },
          update: { content: patch.note },
          create: { readingId: id, content: patch.note },
        });
        await tx.tarotReading.update({
          where: { id },
          data: { note: patch.note },
        });
      }
    });
  },

  async delete(id: string, ownerIds?: string[]): Promise<void> {
    const result = await prisma.tarotReading.deleteMany({
      where: { id, ...(ownerIds ? { ownerId: { in: ownerIds } } : {}) },
    });
    if (result.count !== 1) throw new Error("READING_NOT_FOUND");
  },

  async exportByIds(
    ids: string[],
    ownerIds: string[],
  ): Promise<OwnedReading[]> {
    return prisma.$transaction(async (tx) => {
      const rows = await tx.tarotReading.findMany({
        where: { id: { in: ids }, ownerId: { in: ownerIds } },
        include: readingInclude,
      });
      if (rows.length !== ids.length) throw new Error("UNAUTHORIZED_BULK");
      const byId = new Map(rows.map((row) => [row.id, rowToRecord(row)]));
      return ids.map((id) => byId.get(id)!);
    });
  },

  async bulk(
    action: "delete" | "favorite" | "unfavorite",
    ids: string[],
    ownerIds: string[],
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const rows = await tx.tarotReading.findMany({
        where: { id: { in: ids }, ownerId: { in: ownerIds } },
        select: { id: true, ownerId: true, userId: true },
      });
      if (rows.length !== ids.length) throw new Error("UNAUTHORIZED_BULK");
      if (action === "delete") {
        await tx.tarotReading.deleteMany({
          where: { id: { in: ids }, ownerId: { in: ownerIds } },
        });
        return;
      }
      for (const row of rows) {
        if (action === "favorite")
          await tx.favorite.upsert({
            where: {
              ownerId_targetType_targetId: {
                ownerId: row.ownerId,
                targetType: "reading",
                targetId: row.id,
              },
            },
            update: { userId: row.userId, readingId: row.id },
            create: {
              ownerId: row.ownerId,
              userId: row.userId,
              readingId: row.id,
              targetType: "reading",
              targetId: row.id,
            },
          });
        else
          await tx.favorite.deleteMany({
            where: {
              ownerId: row.ownerId,
              targetType: "reading",
              targetId: row.id,
            },
          });
        await tx.tarotReading.update({
          where: { id: row.id },
          data: { favorite: action === "favorite" },
        });
      }
    });
  },

  async claimByUser(anonId: string, userId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const anonymousFavorites = await tx.favorite.findMany({
        where: { ownerId: anonId },
        select: { id: true, targetType: true, targetId: true },
      });
      for (const favorite of anonymousFavorites) {
        const existing = await tx.favorite.findUnique({
          where: {
            ownerId_targetType_targetId: {
              ownerId: userId,
              targetType: favorite.targetType,
              targetId: favorite.targetId,
            },
          },
        });
        if (existing) await tx.favorite.delete({ where: { id: favorite.id } });
      }
      await tx.favorite.updateMany({
        where: { ownerId: anonId },
        data: { ownerId: userId, userId },
      });
      await tx.tarotReading.updateMany({
        where: { ownerId: anonId },
        data: { ownerId: userId, userId },
      });
    });
  },
};
