import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { ProjectShowcase } from "@/components/project-showcase";

export const metadata: Metadata = {
  title: "Projects",
  description: "Interactive projects exploring the details behind reliable web experiences.",
};

export default function Projects() {
  return (
    <>
      <PageIntro title={<>Selected <span className="accent-text">projects.</span></>}>
        Interactive projects exploring the details behind reliable web experiences.
      </PageIntro>
      <ProjectShowcase />
    </>
  );
}
