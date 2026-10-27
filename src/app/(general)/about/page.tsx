import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { linkedinUrl } from "@/lib/experience";
export const metadata: Metadata = {
  title: "About",
  description:
    "Elizabeth Alcalá, a senior software engineer in Lima building web products and AI-powered tools.",
};
export default function About() {
  return (
    <>
      <PageIntro
        title={
          <>
            About <span className="accent-text">me.</span>
          </>
        }
      >
        I’m Elizabeth, a senior software engineer in Lima, Perú. I work across React and
        TypeScript interfaces, backend integration, and AI-powered tools.
      </PageIntro>
      <div className="about-grid">
        <div className="prose">
          <p>
            I’m interested in the boundaries where an application becomes harder to reason
            about: a user and an agent editing the same document, a request crossing
            services, or a model choosing a tool.
          </p>
          <p>
            My notes capture ideas and open questions from that work, using simplified
            public examples.
          </p>
          <div className="button-row">
            <Link className="text-link" href="/experience">
              View my experience →
            </Link>
            <Link className="text-link" href="/notes">
              Engineering notes →
            </Link>
          </div>
        </div>
        <aside className="about-card">
          <span className="eyebrow">LET’S CONNECT</span>
          <a href="mailto:elizabethalcala28@gmail.com">
            Email <ArrowUpRight size={17} />
          </a>
          <a href="https://github.com/elisealcala" target="_blank" rel="noreferrer">
            GitHub <ArrowUpRight size={17} />
          </a>
          <a href={linkedinUrl} target="_blank" rel="noreferrer">
            LinkedIn <ArrowUpRight size={17} />
          </a>
          <a href="https://twitter.com/elisealcala" target="_blank" rel="noreferrer">
            Twitter <ArrowUpRight size={17} />
          </a>
        </aside>
      </div>
    </>
  );
}
