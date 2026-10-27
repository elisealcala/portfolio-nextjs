import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

const dateSchema = z
  .union([z.string().date(), z.string().datetime({ offset: true }), z.date()])
  .transform((value) => new Date(value).toISOString());

const metadataSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    publishedAt: dateSchema,
    updatedAt: dateSchema.optional(),
    status: z.enum(["published", "draft"]),
    topic: z.string().default("Archive"),
    kind: z.enum(["idea", "study", "project", "article"]).default("article"),
  })
  .refine((article) => !article.updatedAt || article.updatedAt >= article.publishedAt, {
    message: "Update date cannot precede publication",
    path: ["updatedAt"],
  });
export type Article = z.infer<typeof metadataSchema> & {
  content: string;
  minutes: number;
};
export type Collection = "posts" | "notes";

export function getArticles(collection: Collection): Article[] {
  const folder = path.join(
    process.cwd(),
    collection === "posts" ? "outstatic/content/posts" : "content/notes"
  );
  const articles = fs
    .readdirSync(folder)
    .filter((f) => f.endsWith(".md"))
    .map((filename) => {
      const raw = fs.readFileSync(path.join(folder, filename), "utf8");
      const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(raw);
      if (!frontmatter) throw new Error(`Missing frontmatter: ${filename}`);
      const data: unknown = parseYaml(frontmatter[1], { maxAliasCount: 50 });
      const content = raw.slice(frontmatter[0].length);
      const metadata = metadataSchema.parse(data);
      if (metadata.slug !== filename.slice(0, -3))
        throw new Error(`Slug differs from filename: ${filename}`);
      return {
        ...metadata,
        content,
        minutes: Math.max(1, Math.ceil(content.split(/\s+/).length / 200)),
      };
    });
  if (new Set(articles.map((a) => a.slug)).size !== articles.length)
    throw new Error("Duplicate article slug");
  return articles
    .filter((a) => a.status === "published")
    .sort((a, b) => {
      const dateA =
        collection === "notes" ? (a.updatedAt ?? a.publishedAt) : a.publishedAt;
      const dateB =
        collection === "notes" ? (b.updatedAt ?? b.publishedAt) : b.publishedAt;
      return dateB.localeCompare(dateA) || a.slug.localeCompare(b.slug);
    });
}

export function getArticle(collection: Collection, slug: string) {
  return getArticles(collection).find((article) => article.slug === slug);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}
