"use server";

import { cookies } from "next/headers";

export async function getToken(tokenKey: string): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(tokenKey);
  return token?.value ?? null;
}

export async function setToken(token: string, tokenKey: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(tokenKey, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function removeToken(tokenKey: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(tokenKey);
}
