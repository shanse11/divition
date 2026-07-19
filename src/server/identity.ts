import "server-only";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";

export const ANON_COOKIE = "astral_anon_id";

/** 读取匿名访客 ID(不存在时返回 null,写入需在 Route Handler / Server Action 中进行) */
export async function getAnonId(): Promise<string | null> {
  const store = await cookies();
  return store.get(ANON_COOKIE)?.value ?? null;
}

/** 在可写上下文中确保匿名 ID 存在 */
export async function ensureAnonId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(ANON_COOKIE)?.value;
  if (existing) return existing;
  const id = `anon_${nanoid(21)}`;
  store.set(ANON_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return id;
}
