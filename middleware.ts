import authConfig from "@/auth.config";
import {
  DEFALUT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from "@/routes";
import NextAuth from "next-auth";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // Allow anyone to access the /api/series route without login or sign up
  if (nextUrl.pathname === "/api/series") {
    return null;
  }

  if (isApiAuthRoute) {
    return null;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFALUT_LOGIN_REDIRECT, nextUrl));
    }
    return null;
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/auth/sign-in", nextUrl));
  }

  if (isPublicRoute) {
    return null;
  }

  if (nextUrl.pathname === "/api/categories") {
    return null;
  }

  return null;
});

export const config = {
  matcher: [
    "/studio",
    "/studio/billing",
    "/studio/cast",
    "/studio/categories"
  ],
}
