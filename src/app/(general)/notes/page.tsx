import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { getArticles } from "@/lib/content";
import { NoteCard } from "@/components/note-card";
export const metadata: Metadata = {
  title: "Engineering notes",
  description:
    "Working ideas from building AI tools, collaborative editors, and reliable applications.",
};
export default function Notes() {
  const notes = getArticles("notes");
  return (
    <>
      <PageIntro
        title={
          <>
            Engineering <span className="accent-text">notes.</span>
          </>
        }
      >
        Ideas from my work on AI tools and collaborative editors. Questions, tradeoffs,
        and what I’d try next.
      </PageIntro>
      <div className="note-grid all-notes">
        {notes.map((note) => (
          <NoteCard key={note.slug} note={note} heading="h2" />
        ))}
      </div>
    </>
  );
}
