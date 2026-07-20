import "server-only";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";
import { logger } from "@/lib/logger";

const SESSION_COOKIE = "astral_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface SessionUser {
  id: string;
  email: string;
  nickname: string;
  avatarSeed: string;
  bio: string;
  birthDate: string | null;
}

/** 读取当前登录用户,未登录返回 null */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) {
    return null;
  }
  const { user } = session;
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    avatarSeed: user.avatarSeed,
    bio: user.bio,
    birthDate: user.birthDate?.toISOString().slice(0, 10) ?? null,
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** 创建会话并写入 Cookie */
export async function createSession(userId: string): Promise<void> {
  const token = nanoid(40);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({ data: { token, userId, expiresAt } });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
  logger.info("auth.session_created", { userId });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { token } });
  store.delete(SESSION_COOKIE);
}

/** 删除账号后仅清理浏览器 Cookie；数据库会话已在账号事务中级联删除。 */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
