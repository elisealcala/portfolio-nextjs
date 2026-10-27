import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SystemDiagram } from "@/components/system-diagram";
import report from "../../../evals/report.json";
const measurements: { estimatedCostUsd: number | null; medianLatencyMs: number | null } =
  report;
export const metadata: Metadata = {
  title: "Building the Knowledge Explorer",
  description:
    "A case study in bounded tool use, cited answers, inspectable execution, and an enforced AI budget.",
};
export default function Project() {
  return (
    <>
      <PageIntro
        title={
          <>
            Building the <span className="accent-text">Explorer.</span>
          </>
        }
        actions={
          <>
            <Link className="button primary" href="/lab">
              Try the explorer <ArrowUpRight size={17} />
            </Link>
            <a
              className="text-link"
              href="https://github.com/elisealcala/portfolio-nextjs"
              target="_blank"
              rel="noreferrer"
            >
              Project repository ↗
            </a>
          </>
        }
      >
        An AI application that answers from public notes, cites its sources, and limits
        its spending.
      </PageIntro>
      <div className="case-layout">
        <div className="prose">
          <h2>Architecture</h2>
          <p>
            Next.js serves static pages. A Cloudflare Worker runs the agent, while D1
            stores six public notes, search indexes, and spending records. Keyword search
            keeps retrieval simple at this scale.
          </p>
          <SystemDiagram compact />
          <h2>Boundaries</h2>
          <p>
            The agent can search and read notes, with up to three tool calls and a
            30-second deadline. Each run reserves $0.05 against a $10 monthly AI
            allowance; known usage releases the unused balance. If AI is unavailable,
            browsing and local search still work.
          </p>
          <p>
            Answers must cite notes the agent read and quote text that exists in those
            notes. These checks establish provenance; human review still needs to assess
            whether the answer follows from the evidence.
          </p>
          <h2>Evaluation</h2>
          <p>
            The 30-question suite covers 20 answerable, five unsupported, and five
            adversarial questions. The target is valid citations throughout and at least
            90% supported answers on the answerable set.
          </p>
          <div className="evaluation-status">
            <strong>
              {report.status === "not_run" ? "Not run yet" : "Results available"}
            </strong>
            <p>
              {report.status === "not_run"
                ? "Live evaluation and deployed CPU checks are pending account setup."
                : report.note}
            </p>
            <details className="evaluation-details">
              <summary>Model configuration</summary>
              <span className="mono small">
                30 CASES · {report.model} · {report.date ?? "NO RUN DATE"}
              </span>
              <span className="mono small">
                REASONING {report.configuration.reasoning.toUpperCase()} · STANDARD
                PROCESSING · {report.configuration.maxOutputTokens} OUTPUT TOKENS /
                REQUEST
              </span>
            </details>
            {report.status === "reviewed" &&
              measurements.estimatedCostUsd !== null &&
              measurements.medianLatencyMs !== null && (
                <p>
                  Evaluation cost: ${measurements.estimatedCostUsd.toFixed(6)} estimated
                  from token usage, excluding taxes. Median response time:{" "}
                  {(measurements.medianLatencyMs / 1000).toFixed(2)} seconds.
                </p>
              )}
          </div>
        </div>
        <aside className="case-sidebar">
          <dl>
            <dt>Role</dt>
            <dd>Full-stack implementation</dd>
            <dt>Interface</dt>
            <dd>Next.js · React · Tailwind</dd>
            <dt>Runtime</dt>
            <dd>Cloudflare Worker · D1</dd>
            <dt>AI</dt>
            <dd>OpenAI Responses API</dd>
          </dl>
        </aside>
      </div>
    </>
  );
}
