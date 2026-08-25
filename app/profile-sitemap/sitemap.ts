import type { MetadataRoute } from "next";
import {
  API_PREFIX,
  USER_PATH,
  Route,
} from "../../src/Breads-Shared/APIConfig";
import { buildChunkedSitemap } from "../../src/lib/buildChunkedSitemap";

/**
 * Profile sitemap — chunked via Next.js `generateSitemaps()`.
 *
 * Convention confirmed by Task 010's spike (see .ccpm/context/handoffs/010.md):
 * a `sitemap.ts` file at `app/<segment>/` with a `generateSitemaps()` export
 * gets served by Next 14.2.x at `/<segment>/sitemap/<id>.xml` — NOT
 * `/<segment>.xml/[id]/route.ts` and NOT `/<segment>/[id].xml` as originally
 * sketched in 011.md. For this file (`app/profile-sitemap/sitemap.ts`) the
 * real, final URLs are:
 *   /profile-sitemap/sitemap/0.xml, /profile-sitemap/sitemap/1.xml, ...
 *
 * Source: Task 003's `GET /users/sitemap-eligible` (see handoffs/003.md).
 * `app/sitemap.ts` (the existing static 4-URL sitemap) is untouched — this
 * is a separate route per AD-1.
 */

interface SitemapEligibleUser {
  userId: string;
  updatedAt: string;
}

interface SitemapEligibleResponse {
  data: SitemapEligibleUser[];
  nextCursor: string | null;
  totalCount: number | null;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://breads.sytes.net";
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function fetchPage(
  cursor: string | null,
): Promise<SitemapEligibleResponse> {
  const params = new URLSearchParams({ limit: "1000" });
  if (cursor) params.set("cursor", cursor);

  const res = await fetch(
    `${apiUrl}${API_PREFIX}${Route.USER}${USER_PATH.SITEMAP_ELIGIBLE}?${params.toString()}`,
    {
      // Header name per Task 003's contract (handoffs/003.md): exactly
      // `x-sitemap-secret`. Env var below is not yet populated in .env —
      // see .env.example for the documented placeholder.
      headers: { "x-sitemap-secret": process.env.SITEMAP_SHARED_SECRET ?? "" },
    },
  );

  if (!res.ok) {
    throw new Error(
      `[profile-sitemap] GET sitemap-eligible failed: ${res.status} ${res.statusText}`,
    );
  }

  // Response is wrapped in `metadata` (this repo's convention for every API
  // response) — read from body.metadata, NOT body.data.
  const body = await res.json();
  return body.metadata as SitemapEligibleResponse;
}

const { generateSitemaps: gen, getChunk } =
  buildChunkedSitemap<SitemapEligibleUser>({
    fetchPage,
    baseUrl,
    urlBuilder: (item) => `${baseUrl}/users/${item.userId}`,
    lastModifiedField: "updatedAt",
  });

export async function generateSitemaps() {
  return gen();
}

// 24h, per FR-11 (self-healing: a user that stops being eligible — banned,
// followersCount drops below 10 — drops out of the sub-sitemap by the next
// revalidation, no manual redeploy needed).
export const revalidate = 86400;

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  return getChunk(id);
}
