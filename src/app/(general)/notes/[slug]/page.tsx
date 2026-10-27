import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticles, getArticle, formatDate } from "@/lib/content";
import { Markdown } from "@/components/markdown";
type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return getArticles("notes").map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const note = getArticle("notes", slug);
  return note
    ? {
        title: note.title,
        description: note.description,
        alternates: { canonical: `/notes/${slug}` },
        openGraph: {
          type: "article",
          publishedTime: note.publishedAt,
          modifiedTime: note.updatedAt,
        },
      }
    : {};
}
export default async function Note({ params }: Props) {
  const { slug } = await params;
  const note = getArticle("notes", slug);
  if (!note) notFound();
  return (
    <article className="article">
      <Link href="/notes" className="text-link">
        ← Engineering notes
      </Link>
      <header>
        <span className="eyebrow">
          {note.topic} · {note.kind === "idea" ? "WORKING IDEA" : "ENGINEERING STUDY"}
        </span>
        <h1>{note.title}</h1>
        <p>{note.description}</p>
        <div className="mono muted small">
          Published{" "}
          <time dateTime={note.publishedAt}>{formatDate(note.publishedAt)}</time>
          {note.updatedAt && (
            <>
              {" "}
              · Updated{" "}
              <time dateTime={note.updatedAt}>{formatDate(note.updatedAt)}</time>
            </>
          )}{" "}
          · {note.minutes} MIN READ
        </div>
      </header>
      <Markdown content={note.content} />
    </article>
  );
}
