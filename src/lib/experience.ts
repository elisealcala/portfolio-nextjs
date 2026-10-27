// Curated from the supplied résumé and public LinkedIn experience, reviewed
// October 27, 2026. Consulting employers and their clients remain distinct.
export const linkedinUrl = "https://www.linkedin.com/in/elisealcala/";

export const featuredExperience = [
  {
    company: "RAVN",
    client: "SchoolAI",
    role: "Senior Full-Stack Engineer",
    start: "2025-04",
    end: null,
    period: "Apr 2025 — Present",
    title: "AI tools for the classroom",
    summary:
      "Building embedded classroom tools that connect teachers and students with AI agents.",
    contributions: [
      "Migrated mini-app communication to MCP and built shared iframe host and client packages.",
      "Built versioned AI content storage with optimistic concurrency, collaborative autosave, and replay.",
      "Added tool observability and improved accessibility in shared React components.",
    ],
    skills: ["React", "TypeScript", "MCP", "Datadog"],
  },
  {
    company: "Palmsbet",
    client: null,
    role: "Frontend Lead",
    start: "2023-08",
    end: "2024-12",
    period: "Aug 2023 — Dec 2024",
    title: "A new frontend foundation",
    summary:
      "Led a migration from vanilla JavaScript to Next.js, guiding architecture for a four-engineer team.",
    contributions: [
      "Introduced Storybook and shared component standards with the design team.",
      "Owned the Vercel and AWS delivery pipeline and mentored junior engineers.",
    ],
    skills: ["Next.js", "TypeScript", "Storybook", "AWS"],
  },
  {
    company: "BairesDev",
    client: "Pinterest",
    role: "Software Engineer",
    start: "2022-01",
    end: "2022-05",
    period: "Jan 2022 — May 2022",
    title: "Merchant onboarding experiments",
    summary:
      "Worked with Pinterest’s Merchant Acquisition Squad on onboarding and product experiments.",
    contributions: [
      "Shipped onboarding improvements and used SQL analysis to evaluate A/B experiments.",
      "Partnered with product on new UX proposals and presented findings in weekly sessions.",
    ],
    skills: ["Product experimentation", "SQL", "A/B testing"],
  },
] as const;

export const earlierExperience = [
  {
    company: "Genium",
    client: "Good Vets",
    period: "Oct 2022 — Mar 2023",
    summary:
      "Built a Next.js and Contentful website, optimized media delivery, and worked closely with the client.",
  },
  {
    company: "Mi Águila",
    client: null,
    period: "Dec 2020 — Sep 2021",
    summary:
      "Moved static hosting toward server-side rendering on AWS and simplified personalization features.",
  },
  {
    company: "Dreamcode",
    client: "Wyndham Hotels & Omedym",
    period: "Dec 2019 — Sep 2020",
    summary: "Built a Vue.js component library and a React/Electron kiosk application.",
  },
  {
    company: "Crehana",
    client: null,
    period: "May 2018 — Oct 2019",
    summary: "Delivered React features in a fast-moving product team.",
  },
] as const;
