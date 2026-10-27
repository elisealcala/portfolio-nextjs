import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { ExperienceList } from "@/components/experience-list";
import { earlierExperience, linkedinUrl } from "@/lib/experience";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Selected engineering experience across AI classroom tools, frontend architecture, and product experimentation.",
};

export default function Experience() {
  return (
    <>
      <PageIntro
        title={
          <>
            Selected <span className="accent-text">experience.</span>
          </>
        }
        actions={
          <a className="text-link" href={linkedinUrl} target="_blank" rel="noreferrer">
            LinkedIn ↗
          </a>
        }
      >
        AI tools, frontend platforms, and the product decisions behind them.
      </PageIntro>
      <section aria-labelledby="selected-roles">
        <h2 id="selected-roles" className="sr-only">
          Selected roles
        </h2>
        <ExperienceList detailed />
      </section>
      <details className="earlier-experience">
        <summary>Earlier experience</summary>
        {earlierExperience.map((work) => (
          <article key={work.company}>
            <h2>
              {work.company}
              {work.client ? ` · ${work.client}` : ""}
            </h2>
            <span className="mono muted">{work.period}</span>
            <p>{work.summary}</p>
          </article>
        ))}
      </details>
    </>
  );
}
