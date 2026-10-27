import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import Link from "next/link";
import { Explorer } from "@/components/explorer";
import { getArticles } from "@/lib/content";
export const metadata: Metadata = {
  title: "Knowledge Explorer",
  description:
    "Explore a bounded agent that searches engineering notes, reads evidence, and cites its sources.",
};
export default function Lab() {
  const notes = getArticles("notes").map((n) => ({
    id: n.slug,
    title: n.title,
    description: n.description,
    topic: n.topic,
    url: `/notes/${n.slug}`,
    content: n.content.trim(),
  }));
  return (
    <>
      <PageIntro
        className="lab-intro"

        title={
          <>
            Knowledge <span className="accent-text">Explorer.</span>
          </>
        }
        actions={
          <Link className="text-link" href="/projects/knowledge-explorer">
            How this is built ↗
          </Link>
        }
      >
        Ask about my engineering notes. Follow the sources.
      </PageIntro>
      <Explorer notes={notes} />
      <p className="lab-privacy">
        Live questions go to OpenAI. This site doesn’t save conversations; provider
        retention policies apply. Keep questions public.
      </p>
    </>
  );
}
