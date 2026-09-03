import { NextRequest, NextResponse } from "next/server";

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

  if (pathname === "/login" || pathname === "/signup") {
    if (hasAuth) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

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
