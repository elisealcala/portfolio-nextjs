import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle, getArticles, formatDate } from "@/lib/content";
import { Markdown } from "@/components/markdown";
type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return getArticles("posts").map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getArticle("posts", slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: { type: "article", publishedTime: post.publishedAt },
  };
}
export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getArticle("posts", slug);
  if (!post) notFound();
  return (
    <article className="article">
      <Link href="/blog" className="text-link">
        ← Writing archive
      </Link>
      <header>
        <span className="eyebrow">
          ARCHIVE · {formatDate(post.publishedAt)} · {post.minutes} MIN READ
        </span>
        <h1>{post.title}</h1>
        <p>{post.description}</p>
      </header>
      <aside className="article-notice">
        Archived article. Examples may use older APIs.
      </aside>
      <Markdown content={post.content} />
    </article>
  );
}
