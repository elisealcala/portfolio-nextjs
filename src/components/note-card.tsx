import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatDate, type Article } from "@/lib/content";

export function NoteCard({
  note,
  heading: Heading = "h3",
}: {
  note: Article;
  heading?: "h2" | "h3";
}) {
  return (
    <Link className="note-card" href={`/notes/${note.slug}`} data-reveal>
      <div className="note-card-top">
        <span className="eyebrow">{note.topic}</span>
        <ArrowUpRight size={18} aria-hidden="true" />
      </div>
      <Heading>{note.title}</Heading>
      <p>{note.description}</p>
      <div className="note-card-bottom">
        <time dateTime={note.updatedAt ?? note.publishedAt}>
          {note.updatedAt ? "Updated " : ""}
          {formatDate(note.updatedAt ?? note.publishedAt)}
        </time>
        <span>{note.minutes} min read</span>
      </div>
    </Link>
  );
}
