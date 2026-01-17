import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const pathname = request.nextUrl.pathname;
  const authPaths = ["/auth/login", "/auth/sign-up"];
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));

  // Block authenticated users from accessing auth routes
  if (token && isAuthPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect unauthenticated users to login (except for public routes)
  if (
    !token &&
    pathname !== "/" &&
    pathname !== "/auth/sign-in" &&
    pathname !== "/auth/sign-up" &&
    pathname !== "/studio"
  ) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

// export const config = {
//   matcher: [
//     "/studio",
//     "/studio/billing",
//     "/studio/cast",
//     "/studio/categories"
//   ],
// }
