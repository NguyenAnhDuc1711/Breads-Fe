import type { MetadataRoute } from "next";

/**
 * Generates /robots.txt for search engine crawler control.
 * - Public pages (posts, user profiles, search): allowed
 * - Private pages (chat, activity, admin, setting, update): disallowed
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://breads.social";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/users/", "/posts/", "/search"],
        disallow: [
          "/chat/",
          "/activity/",
          "/admin/",
          "/setting",
          "/update",
          "/banned",
          "/error",
          "/reset-pw/",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
