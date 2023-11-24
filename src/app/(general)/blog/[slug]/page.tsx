import { getDocumentBySlug, getDocumentSlugs } from "outstatic/server";
import { MDXRemote } from "next-mdx-remote/rsc";
import Code from "@/components/code";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface Params {
  params: {
    slug: string;
  };
}

export async function generateMetadata(params: Params): Promise<Metadata> {
  const post = await getData(params);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: "",
      images: [
        {
          url: "",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: "",
    },
  };
}

async function getData({ params }: Params) {
  const post = getDocumentBySlug("posts", params.slug, [
    "title",
    "publishedAt",
    "description",
    "slug",
    "author",
    "content",
    "coverImage",
  ]);

  if (!post) {
    notFound();
  }

  return {
    ...post,
  };
}

export async function generateStaticParams() {
  const posts = getDocumentSlugs("posts");
  return posts.map((slug) => ({ slug }));
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

const BlogSlugPage = async (params: Params) => {
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
