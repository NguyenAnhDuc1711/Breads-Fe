import type { MetadataRoute } from "next";
import { generateSitemaps as generatePostSitemaps } from "./post-sitemap/sitemap";
import { generateSitemaps as generateProfileSitemaps } from "./profile-sitemap/sitemap";

/**
 * Generates /robots.txt for search engine crawler control.
 * - Public pages (posts, user profiles, search): allowed
 * - Private pages (chat, activity, setting, update): disallowed
 *
 * Sitemap URLs: Task 010's spike (see .ccpm/context/handoffs/010.md) found
 * that a `generateSitemaps()`-based route (app/post-sitemap/sitemap.ts,
 * app/profile-sitemap/sitemap.ts) does NOT get a bare `/post-sitemap/
 * sitemap.xml` index URL from Next.js — only per-chunk URLs like
 * `/post-sitemap/sitemap/0.xml` exist. Verified directly here (Task 011) via
 * `npm run build` + a production server: the bare index URL 404s (there is
 * no auto-generated index). So instead of guessing a fixed 3-line
 * robots.txt, this reuses each route's own `generateSitemaps()` export
 * (same function Next.js itself calls to enumerate chunks — no duplicated
 * pagination/fetch logic here, per QUAL-1) to list the REAL per-chunk URLs.
 * robots.txt supports multiple `Sitemap:` lines (Google-documented).
 *
 * If the backend is unreachable at build/request time, `generateSitemaps()`
 * degrades to `[]` (buildChunkedSitemap's build-resilience fix) rather than
 * throwing, so robots.txt still renders — just without post/profile
 * sitemap lines until the backend is reachable again.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://breads.sytes.net";

  const [postChunks, profileChunks] = await Promise.all([
    generatePostSitemaps(),
    generateProfileSitemaps(),
  ]);

  const sitemap = [
    `${baseUrl}/sitemap.xml`,
    ...postChunks.map(({ id }) => `${baseUrl}/post-sitemap/sitemap/${id}.xml`),
    ...profileChunks.map(
      ({ id }) => `${baseUrl}/profile-sitemap/sitemap/${id}.xml`,
    ),
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/users/", "/posts/", "/search"],
        disallow: [
          "/chat/",
          "/activity/",
          "/setting",
          "/update",
          "/banned",
          "/error",
          "/reset-pw/",
          "/api/",
        ],
      },
    ],
    sitemap,
  };
}

// 24h, matching both sitemap routes' revalidate window — keeps robots.txt's
// chunk listing in sync with what the sitemap routes actually serve.
export const revalidate = 86400;
