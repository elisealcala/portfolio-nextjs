import type { MetadataRoute } from "next";
import { getArticles } from "@/lib/content";
import { siteUrl } from "@/lib/site";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...["", "/projects", "/experience", "/notes", "/blog", "/about"].map((url) => ({
      url: `${siteUrl}${url}`,
    })),
    ...getArticles("posts").map((a) => ({
      url: `${siteUrl}/blog/${a.slug}`,
      lastModified: a.publishedAt,
    })),
    ...getArticles("notes").map((a) => ({
      url: `${siteUrl}/notes/${a.slug}`,
      lastModified: a.updatedAt ?? a.publishedAt,
    })),
  ];
}
