import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import BlogCard from "@/components/blog-card";
import { getArticles } from "@/lib/content";
export const metadata: Metadata = {
  title: "Writing archive",
  description:
    "The early chapters: original posts on React, TypeScript, GraphQL, and building for the web.",
};
export default function BlogPage() {
  const posts = getArticles("posts");
  return (
    <>
      <PageIntro
        title={
          <>
            Writing <span className="accent-text">archive.</span>
          </>
        }
      >
        Early writing from 2020. Some examples use older APIs.
      </PageIntro>
      <div className="archive-list">
        {posts.map((p) => (
          <BlogCard key={p.slug} slug={p.slug} title={p.title} date={p.publishedAt} />
        ))}
      </div>
    </>
  );
}
