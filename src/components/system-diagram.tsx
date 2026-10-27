import { ArrowRight, FileText, ScanSearch, ShieldCheck } from "lucide-react";

export function SystemDiagram({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`system-diagram ${compact ? "compact" : ""}`}
      aria-label="A bounded agent searches public notes, reads evidence, and validates its answer"
    >
      <div className="diagram-top">
        <span className="status-dot" />
        <span className="mono">KNOWLEDGE EXPLORER</span>
      </div>
      <div className="diagram-question">
        <p>How do you prevent lost edits?</p>
        <ArrowRight size={19} aria-hidden="true" />
      </div>
      <div className="diagram-flow">
        <div>
          <ScanSearch size={20} aria-hidden="true" />
          <strong>Search</strong>
        </div>
        <ArrowRight className="flow-arrow" size={16} aria-hidden="true" />
        <div>
          <FileText size={20} aria-hidden="true" />
          <strong>Read</strong>
        </div>
        <ArrowRight className="flow-arrow" size={16} aria-hidden="true" />
        <div>
          <ShieldCheck size={20} aria-hidden="true" />
          <strong>Verify</strong>
        </div>
      </div>
      <div className="diagram-output">
        <span>An answer with sources.</span>
        <span className="source-tag">[source]</span>
      </div>
    </div>
  );
}
