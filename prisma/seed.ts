import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Astral2026", 12);
  await prisma.user.upsert({
    where: { email: "demo@astral-oracle.local" },
    update: {},
    create: {
      email: "demo@astral-oracle.local",
      passwordHash,
      nickname: "星夜旅人",
      bio: "在牌面与星光之间练习倾听。",
      settings: { create: {} },
    },
  });

  const achievements = [
    {
      id: "first-light",
      name: "初见星光",
      description: "完成第一次每日一牌",
      icon: "sparkles",
      threshold: 1,
    },
    {
      id: "seven-days",
      name: "七日星轨",
      description: "连续七天查看每日一牌",
      icon: "calendar",
      threshold: 7,
    },
    {
      id: "three-days",
      name: "三日星轨",
      description: "连续三天查看每日一牌",
      icon: "sparkles",
      threshold: 3,
    },
    {
      id: "thirty-days",
      name: "月之守望",
      description: "连续三十天查看每日一牌",
      icon: "moon",
      threshold: 30,
    },
    {
      id: "thirty-readings",
      name: "长夜灯塔",
      description: "累计查看三十次每日一牌",
      icon: "lamp",
      threshold: 30,
    },
  ];
  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { id: achievement.id },
      update: achievement,
      create: achievement,
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
