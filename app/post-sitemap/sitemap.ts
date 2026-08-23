import type { MetadataRoute } from "next";
import { API_PREFIX, POST_PATH, Route } from "../../src/Breads-Shared/APIConfig";
import { buildChunkedSitemap } from "../../src/lib/buildChunkedSitemap";

/**
 * Post sitemap — chunked via Next.js `generateSitemaps()`.
 *
 * Convention confirmed by spike (this file's location IS the contract, see
 * .ccpm/context/handoffs/010.md): a `sitemap.ts` file at `app/<segment>/`
 * with a `generateSitemaps()` export gets served by Next 14.2.x at
 * `/<segment>/sitemap/<id>.xml` — NOT `/<segment>.xml/[id]/route.ts` and NOT
 * `/<segment>/[id].xml` as originally sketched in 010.md. For this file
 * (`app/post-sitemap/sitemap.ts`) the real, final URLs are:
 *   /post-sitemap/sitemap/0.xml, /post-sitemap/sitemap/1.xml, ...
 *
 * Source: Task 002's `GET /posts/sitemap-eligible` (see handoffs/002.md).
 * `app/sitemap.ts` (the existing static 4-URL sitemap) is untouched — this
 * is a separate route per AD-1.
 */

interface SitemapEligiblePost {
  postId: string;
  updatedAt: string;
  engagementScore: number;
}

interface SitemapEligibleResponse {
  data: SitemapEligiblePost[];
  nextCursor: string | null;
  totalCount: number | null;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://breads.social";
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function fetchPage(
  cursor: string | null,
): Promise<SitemapEligibleResponse> {
  const params = new URLSearchParams({ limit: "1000" });
  if (cursor) params.set("cursor", cursor);

  const res = await fetch(
    `${apiUrl}${API_PREFIX}${Route.POST}${POST_PATH.SITEMAP_ELIGIBLE}?${params.toString()}`,
    {
      // Header name per Task 002's contract (handoffs/002.md): exactly
      // `x-sitemap-secret`. Env var below is not yet populated in .env —
      // see .env.example for the documented placeholder.
      headers: { "x-sitemap-secret": process.env.SITEMAP_SHARED_SECRET ?? "" },
    },
  );

  if (!res.ok) {
    throw new Error(
      `[post-sitemap] GET sitemap-eligible failed: ${res.status} ${res.statusText}`,
    );
  }

  // Response is wrapped in `metadata` (this repo's convention for every API
  // response) — read from body.metadata, NOT body.data.
  const body = await res.json();
  return body.metadata as SitemapEligibleResponse;
}

const { generateSitemaps: gen, getChunk } =
  buildChunkedSitemap<SitemapEligiblePost>({
    fetchPage,
    baseUrl,
    urlBuilder: (item) => `${baseUrl}/posts/${item.postId}`,
    lastModifiedField: "updatedAt",
  });

export async function generateSitemaps() {
  return gen();
}

// 24h, per FR-11 (self-healing: a post that stops being eligible drops out
// of the sub-sitemap by the next revalidation, no manual redeploy needed).
export const revalidate = 86400;

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  return getChunk(id);
}
