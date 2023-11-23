import BlogCard from "@/components/blog-card";
import Link from "next/link";
import { getDocuments } from "outstatic/server";

async function getData() {
  const posts = getDocuments("posts", ["title", "description", "publishedAt", "slug"]);

  const sortedPosts = posts
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .filter((_, i) => i < 4);

  return sortedPosts;
}

export default async function Home() {
  const posts = await getData();

  return (
    <div className="max-w-[600px]">
      <div className="text-3xl mb-3">
        {`Hi, my name is Elizabeth Alcalá.`}
        <br /> {`I'm a frontend developer.`}
      </div>
      <p className="mt-6">Check my latest posts.</p>
      <div className="flex flex-col mt-4 mb-8">
        {posts.map((post) => (
          <div className="mb-[10px] mb-8" key={post.slug}>
            <BlogCard
              slug={post.slug}
              title={post.title}
              description={post.description}
              date={post.publishedAt.toString()}
            />
          </div>
        ))}
        <Link href="/blog" className="text-sm underline mt-8">
          View all
        </Link>
      </div>
    </div>
  );
}
