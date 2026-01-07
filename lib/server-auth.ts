import type { NextRequest } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function verifyToken(token: string): Promise<boolean> {
  if (!token) return false;
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Token verification failed");
    }

    return response.ok;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export function buildLoginUrl(request: NextRequest, from?: string) {
  const url = new URL("/auth/login", request.url);
  if (from) url.searchParams.set("from", from);
  return url;
}

export const DASHBOARD_PATH = "/";
