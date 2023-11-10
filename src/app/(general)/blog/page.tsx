import BlogCard from "@/components/blog-card";
import { getDocuments } from "outstatic/server";

async function getData() {
  const posts = getDocuments("posts", ["title", "description", "publishedAt", "slug"]);

  const sortedPosts = posts.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return sortedPosts;
}

const BlogPage = async () => {
  const posts = await getData();

  return (
    <div className="flex flex-col">
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
    </div>
  );
};

export default BlogPage;
