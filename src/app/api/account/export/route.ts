import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";

function parseJson(value: string | null) {
  if (value === null) return null;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser)
    return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const data = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({
      where: { id: currentUser.id },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatarSeed: true,
        bio: true,
        birthDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    const [
      settings,
      readings,
      favorites,
      dailyReadings,
      dreamReadings,
      achievements,
    ] = await Promise.all([
      tx.userSettings.findUnique({
        where: { userId: user.id },
        select: {
          defaultStyle: true,
          motionLevel: true,
          musicEnabled: true,
          musicVolume: true,
          shareShowQuestion: true,
          updatedAt: true,
        },
      }),
      tx.tarotReading.findMany({
        where: { OR: [{ userId: user.id }, { ownerId: user.id }] },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          kind: true,
          category: true,
          question: true,
          spreadId: true,
          style: true,
          interpretation: true,
          favorite: true,
          note: true,
          createdAt: true,
          updatedAt: true,
          draws: {
            orderBy: { positionIndex: "asc" },
            select: { cardId: true, reversed: true, positionIndex: true },
          },
          notes: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          shares: { select: { id: true, showQuestion: true, createdAt: true } },
        },
      }),
      tx.favorite.findMany({
        where: { OR: [{ userId: user.id }, { ownerId: user.id }] },
        select: {
          id: true,
          targetType: true,
          targetId: true,
          readingId: true,
          createdAt: true,
        },
      }),
      tx.dailyReading.findMany({
        where: { OR: [{ userId: user.id }, { ownerId: user.id }] },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          date: true,
          cardId: true,
          reversed: true,
          content: true,
          createdAt: true,
        },
      }),
      tx.dreamReading.findMany({
        where: { OR: [{ userId: user.id }, { ownerId: user.id }] },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          input: true,
          result: true,
          title: true,
          note: true,
          favorite: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      tx.userAchievement.findMany({
        where: { userId: user.id },
        orderBy: { unlockedAt: "asc" },
        select: {
          unlockedAt: true,
          achievement: {
            select: {
              id: true,
              name: true,
              description: true,
              icon: true,
              threshold: true,
            },
          },
        },
      }),
    ]);
    return {
      exportedAt: new Date().toISOString(),
      profile: user,
      settings,
      tarotReadings: readings.map(({ interpretation, ...reading }) => ({
        ...reading,
        interpretation: parseJson(interpretation),
        normalizedNotes: reading.notes,
      })),
      favorites,
      dailyReadings: dailyReadings.map(({ content, ...reading }) => ({
        ...reading,
        content: parseJson(content),
      })),
      dreamReadings: dreamReadings.map(({ input, result, ...reading }) => ({
        ...reading,
        input: parseJson(input),
        result: parseJson(result),
      })),
      achievements,
    };
  });

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="astral-account-${date}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}
