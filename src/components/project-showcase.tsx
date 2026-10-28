import { ArrowUpRight } from "lucide-react";

export function ProjectShowcase() {
  return (
    <article className="showcase-project">
      <div className="showcase-copy">
        <span className="eyebrow">INTERACTIVE SANDBOX</span>
        <h2>OCC Sandbox<span className="accent-text">.</span></h2>
        <p>
          What happens when two people save the same document at once? Explore
          optimistic concurrency control through competing editors, live server
          state, and conflict recovery.
        </p>
        <div className="tags" aria-label="Technologies">
          <span>React</span><span>TypeScript</span><span>SQLite</span><span>Cloudflare Workers</span>
        </div>
        <a className="button primary" href="https://occ-sandbox.ezth.workers.dev/" target="_blank" rel="noopener noreferrer">
          Explore the sandbox <ArrowUpRight size={17} aria-hidden="true" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
      <div className="showcase-visual" aria-hidden="true">
        <div className="showcase-visual-header"><span>OCC SANDBOX</span><span>LIVE EXPERIMENT</span></div>
        <div className="showcase-editors">
          <div><span>CLIENT A</span><strong>Editing</strong><i /><i /><i /></div>
          <div><span>CLIENT B</span><strong>Editing</strong><i /><i /><i /></div>
        </div>
        <div className="showcase-result"><span>SERVER TRUTH</span><strong>One document. Two perspectives.</strong></div>
      </div>
    </article>
  );
}
