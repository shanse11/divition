import "server-only";
import { nanoid } from "nanoid";
import { prisma } from "@/server/db";

export const sharesRepo = {
  async createForOwner(
    readingId: string,
    ownerIds: string[],
    showQuestion: boolean,
  ) {
    if (!ownerIds.length) return null;
    const reading = await prisma.tarotReading.findFirst({
      where: { id: readingId, ownerId: { in: ownerIds } },
      select: { id: true },
    });
    if (!reading) return null;
    return prisma.shareLink.create({
      data: { id: nanoid(18), readingId: reading.id, showQuestion },
    });
  },
  async find(id: string) {
    return prisma.shareLink.findUnique({
      where: { id },
      include: { reading: { include: { draws: true } } },
    });
  },
};
