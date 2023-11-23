import { getDocumentBySlug } from "outstatic/server";
import { MDXRemote } from "next-mdx-remote/rsc";
import Code from "@/components/code";

async function getData(params: { slug: string }) {
  const post = getDocumentBySlug("posts", params.slug, [
    "title",
    "publishedAt",
    "description",
    "slug",
    "author",
    "content",
    "coverImage",
  ]);

  return {
    ...post,
  };
}

const components = {
  p: (props: any) => (
    <p {...props} className="text-base font-light leading-[24px] mb-6">
      {props.children}
    </p>
  ),

  h2: (props: any) => (
    <h2 {...props} className="text-2xl font-bold leading-[24px] mt-16 mb-8">
      {props.children}
    </h2>
  ),
  pre: (props: any) => {
    const className = props.children.props.className || "";
    const matches = className.match(/language-(?<lang>.*)/);

    return (
      <Code
        codeString={props.children.props.children.trim()}
        lang={matches?.groups?.lang ? matches.groups.lang : ""}
      />
    );
  },
};

const BlogSlugPage = async ({ params }: { params: { slug: string } }) => {
  const data = await getData(params);

  return (
    <article className="w-full sm:w-[700px] mx-auto mt-8 mb-16">
      <h1 className="text-5xl font-bold mb-12 leading-[1.15]">{data.title}</h1>
      <p className="mb-3">{data.description}</p>
      <MDXRemote source={data.content as unknown as any} components={{ ...components }} />
    </article>
  );
};

export default BlogSlugPage;
