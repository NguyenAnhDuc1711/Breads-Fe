import type { MetadataRoute } from "next";
import { generateSitemaps as generatePostSitemaps } from "./post-sitemap/sitemap";
import { generateSitemaps as generateProfileSitemaps } from "./profile-sitemap/sitemap";

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

export const revalidate = 86400;
