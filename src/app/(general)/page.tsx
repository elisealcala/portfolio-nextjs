import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getArticles } from "@/lib/content";
import { NoteCard } from "@/components/note-card";
import { ExperienceList } from "@/components/experience-list";
export default function Home() {
  const notes = getArticles("notes");
  return (
    <>
      <section className="hero hero-portfolio">
        <div className="hero-heading">
          <div className="hero-kicker">
            <div className="eyebrow">
              <span className="status-dot" />
              SENIOR SOFTWARE ENGINEER · LIMA, PERÚ
            </div>
          </div>
          <h1>
            <span>Thoughtful interfaces.</span>
            <span className="accent-text">Reliable systems.</span>
          </h1>
        </div>
        <div className="hero-copy">
          <p className="hero-description">
            I’m Elizabeth. I build web products and AI-powered tools, with a focus on
            React, TypeScript, and reliable user experiences.
          </p>
          <div className="button-row hero-actions">
            <Link className="button primary" href="/experience">
              View experience <ArrowUpRight size={17} />
            </Link>
            <Link className="text-link" href="/notes">
              Engineering notes <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
      <section
        className="section experience-section"
        aria-labelledby="experience-heading"
      >
        <div className="section-heading" data-reveal>
          <h2 id="experience-heading">Experience.</h2>
          <Link className="text-link" href="/experience">
            View details <ArrowRight size={16} />
          </Link>
        </div>
        <ExperienceList />
      </section>
      <section className="section notes-section">
        <div className="section-heading" data-reveal>
          <div>
            <h2>Engineering notes.</h2>
          </div>
          <Link className="text-link" href="/notes">
            All notes <ArrowRight size={16} />
          </Link>
        </div>
        <div className="note-grid">
          {notes.slice(0, 3).map((note) => (
            <NoteCard key={note.slug} note={note} />
          ))}
        </div>
      </section>
      <section className="contact-band" data-reveal>
        <div>
          <h2>Let’s build something.</h2>
        </div>
        <a className="button primary" href="mailto:elizabethalcala28@gmail.com">
          Get in touch <ArrowUpRight size={17} />
        </a>
      </section>
    </>
  );
}
