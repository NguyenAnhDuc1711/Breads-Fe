import { NextRequest, NextResponse } from "next/server";

// Server-only — LINKPREVIEW_API_KEYS (no NEXT_PUBLIC_ prefix) never reaches
// the client bundle, unlike the previous implementation which called
// api.linkpreview.net directly from a "use client" component with the key
// embedded in the request URL (visible in devtools/browser history).
const apiKeys = (process.env.LINKPREVIEW_API_KEYS ?? "")
  .split(",")
  .map((key) => key.trim())
  .filter(Boolean);

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }
  if (apiKeys.length === 0) {
    return NextResponse.json(
      { error: "Link preview is not configured" },
      { status: 503 }
    );
  }

  // Same "cycle through keys until one isn't over quota" behavior the
  // client-side version had, just executed server-side now.
  for (const key of apiKeys) {
    try {
      const res = await fetch(
        `https://api.linkpreview.net?key=${key}&q=${encodeURIComponent(url)}`
      );
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch {
      // try the next key
    }
  }

  return NextResponse.json(
    { error: "All link preview keys exhausted" },
    { status: 502 }
  );
}
