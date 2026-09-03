import type { MetadataRoute } from "next";
import {
  API_PREFIX,
  POST_PATH,
  Route,
} from "../../src/Breads-Shared/APIConfig";
import { buildChunkedSitemap } from "../../src/lib/buildChunkedSitemap";

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

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://breads.sytes.net";
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function fetchPage(
  cursor: string | null,
): Promise<SitemapEligibleResponse> {
  const params = new URLSearchParams({ limit: "1000" });
  if (cursor) params.set("cursor", cursor);

  const res = await fetch(
    `${apiUrl}${API_PREFIX}${Route.POST}${POST_PATH.SITEMAP_ELIGIBLE}?${params.toString()}`,
    {
      headers: { "x-sitemap-secret": process.env.SITEMAP_SHARED_SECRET ?? "" },
    },
  );

  if (!res.ok) {
    throw new Error(
      `[post-sitemap] GET sitemap-eligible failed: ${res.status} ${res.statusText}`,
    );
  }

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

export const revalidate = 86400;

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  return getChunk(id);
}
