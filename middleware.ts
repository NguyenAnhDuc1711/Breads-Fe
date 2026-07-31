import { NextRequest, NextResponse } from "next/server";

// NOTE: Task 001 specced this file at `src/middleware.ts`, but Next.js only
// discovers middleware next to the router directory — with `app/` at the repo
// root, `src/middleware.ts` is silently ignored (verified: no redirects fired).
// It therefore lives at the repo root. If `app/` ever moves under `src/`, this
// file must move with it.

// Presence-only check (AD-3) — not a new security boundary, real auth
// enforcement stays at the API layer. A stale-but-present `jwt` cookie still
// gets past this gate and only fails at the API, exactly like today's
// client-side `localStorage.getItem("userId")` check did.

const LOGIN_PATH = "/auth/login";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasJwt = !!request.cookies.get("jwt");

  // Logged-in users never need the auth screens.
  if (pathname.startsWith("/auth")) {
    if (hasJwt) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Everything the matcher lets through (other than /auth/*) is protected.
  if (!hasJwt) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/auth/:path*",
    "/for_you",
    "/following",
    "/liked",
    "/saved",
    "/home",
    "/update",
    "/search",
    "/setting/:path*",
    "/activity/:path*",
    "/activity",
    "/chat/:path*",
    "/chat",
    "/admin/:path*",
    "/admin",
  ],
};
