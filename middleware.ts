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

const LOGIN_PATH = "/login";

const PROTECTED_PREFIXES = [
  "/chat",
  "/activity",
  "/following",
  "/liked",
  "/saved",
  "/update",
  "/setting",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuth =
    !!request.cookies.get("refreshToken") || !!request.cookies.get("jwt");

  // Logged-in users never need the auth screens.
  if (pathname === "/login" || pathname === "/signup") {
    if (hasAuth) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Only protect routes that strictly require authentication.
  // Public routes (/, /for_you, /search, /posts/*, /users/*) are allowed for guests.
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !hasAuth) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
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
  ],
};
