"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Clock3,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  localSearch,
  type Answer,
  type NoteSource,
  type SearchResult,
  type Usage,
  type ExplorerEvent,
} from "@/lib/explorer-contract";
import { readEventStream } from "@/lib/event-stream";
import { Turnstile } from "./turnstile";

const examples = [
  "How do you prevent lost edits?",
  "When is keyword search enough?",
  "Where should authorization happen?",
];
type Mode = "example" | "live" | "search";
type Step = { tool: string; detail: string };

export function Explorer({ notes }: { notes: NoteSource[] }) {
  const [mode, setMode] = useState<Mode>("example");
  const [question, setQuestion] = useState(examples[0]);
  const [sources, setSources] = useState<SearchResult[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [running, setRunning] = useState(false);
  const [searched, setSearched] = useState(false);
  const [message, setMessage] = useState("");
  const [live, setLive] = useState(false);
  const [token, setToken] = useState("");
  const [attempt, setAttempt] = useState(0);
  const abort = useRef<AbortController | null>(null);
  const revision = useRef(0);
  const onToken = useCallback((value: string) => setToken(value), []);
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      fetch("/api/status")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => setLive(Boolean(data?.live)))
        .catch(() => setLive(false));
    }
    return () => {
      abort.current?.abort();
    };
  }, []);
  const demoNote = notes.find((n) => n.id === "optimistic-concurrency")!;
  const exampleSource: SearchResult = {
    ...demoNote,
    excerpt:
      "The client sends the version it last observed alongside its proposed content.",
  };
  const displaySources = mode === "example" ? [exampleSource] : sources;
  const displaySteps =
    mode === "example"
      ? [
          { tool: "search_notes", detail: "lost edits optimistic concurrency" },
          { tool: "read_note", detail: "optimistic-concurrency" },
          { tool: "verify_citations", detail: "Match the answer to its source" },
        ]
      : steps;
  const displayAnswer: Answer | null =
    mode === "example"
      ? {
          supported: true,
          answer:
            "Send the version the client last read with its save. Apply the write only if that version still matches the stored document. If it conflicts, preserve the local draft and compare it with the remote version. [optimistic-concurrency]",
          citations: [
            {
              id: "optimistic-concurrency",
              excerpt:
                "The client sends the version it last observed alongside its proposed content.",
            },
          ],
        }
      : answer;

  function changeMode(next: Mode) {
    revision.current++;
    abort.current?.abort();
    setMode(next);
    if (next === "example") setQuestion(examples[0]);
    setRunning(false);
    setSources([]);
    setSteps([]);
    setAnswer(null);
    setUsage(null);
    setMessage("");
    setSearched(false);
  }
  function acceptEvent(event: ExplorerEvent) {
    if (event.type === "tool")
      setSteps((previous) => [...previous, { tool: event.tool, detail: event.detail }]);
    if (event.type === "sources") setSources(event.sources);
    if (event.type === "answer") {
      setAnswer(event.result);
      setSources(event.sources);
    }
    if (event.type === "usage") setUsage(event.usage);
    if (event.type === "error") setMessage(event.message);
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (running) return;
    if (mode === "example") {
      changeMode("search");
      setSources(localSearch(notes, question));
      setSearched(true);
      return;
    }
    setMessage("");
    setAnswer(null);
    setUsage(null);
    setSteps([]);
    setSearched(true);
    if (mode === "search") {
      setSources(localSearch(notes, question));
      return;
    }
    if (!live || !token) return;
    setSources([]);
    setRunning(true);
    const current = ++revision.current;
    const controller = new AbortController();
    abort.current = controller;
    try {
      const response = await fetch("/api/explore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, challengeToken: token }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "The live service is unavailable.");
      }
      if (!response.body) throw new Error("The response stream is unavailable.");
      await readEventStream(response.body, (item) => {
        if (revision.current === current) acceptEvent(item);
      });
    } catch (error) {
      if (revision.current === current)
        setMessage(
          controller.signal.aborted
            ? "Run stopped. You can still inspect the sources."
            : error instanceof Error
              ? error.message
              : "The run could not finish."
        );
    } finally {
      if (revision.current === current) {
        setRunning(false);
        setToken("");
        setAttempt((n) => n + 1);
      }
    }
  }

  return (
    <div className="explorer">
      <div className="lab-toolbar">
        <div className="lab-modes" aria-label="Explorer mode">
          {(
            [
              ["example", "Guided example"],
              ["live", "Live agent"],
              ["search", "Search notes"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => changeMode(value)}
              aria-pressed={mode === value}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="mono lab-status">
          <span className={`status-dot ${running ? "pulse" : ""}`} />
          {running
            ? "RUNNING"
            : mode === "example"
              ? "WALKTHROUGH"
              : mode === "search"
                ? "LOCAL SEARCH"
                : live
                  ? "READY"
                  : "SETUP REQUIRED"}
        </span>
      </div>
      <div className="lab-body">
        <section className="lab-main" aria-label="Question and answer">
          <form onSubmit={submit}>
            <label className="sr-only" htmlFor="question">
              Question or search terms
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => {
                if (mode === "example") changeMode("search");
                setQuestion(e.target.value);
              }}
              maxLength={mode === "search" ? 200 : 1000}
              minLength={3}
              rows={2}
              required
              placeholder="What would you like to understand?"
              disabled={running}
            />
            <div className="lab-input-actions">
              <span className="small muted">
                {mode === "search" ? "Local search · No AI call." : ""}
              </span>
              {running ? (
                <button
                  type="button"
                  className="button"
                  onClick={() => abort.current?.abort()}
                >
                  Stop <X size={15} />
                </button>
              ) : (
                <button
                  className="button primary"
                  type="submit"
                  disabled={mode === "live" && (!live || !token)}
                >
                  {mode === "live" ? "Ask the agent" : "Search notes"}
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
            {mode === "live" && live && <Turnstile onToken={onToken} attempt={attempt} />}
          </form>
          <div className="suggestions">
            {examples.map((example) => (
              <button
                key={example}
                disabled={running}
                onClick={() => {
                  if (mode === "example") changeMode("search");
                  setQuestion(example);
                }}
              >
                {example}
              </button>
            ))}
          </div>
          {mode === "example" && (
            <div className="notice">
              <BookOpen size={16} />
              <p>Written example, not a live AI response.</p>
            </div>
          )}
          {mode === "live" && !live && (
            <div className="notice">
              <ShieldCheck size={17} />
              <p>Live AI is unavailable. Try the example or search the notes.</p>
            </div>
          )}
          {message && (
            <div role="alert" className="notice warning">
              <p>{message}</p>
            </div>
          )}
          <div className="answer-heading">
            <span className="eyebrow">{mode === "search" ? "Results" : "Answer"}</span>
            {displayAnswer && mode !== "example" && (
              <span className="small muted">
                <Check size={13} />
                {displayAnswer.supported ? "Citations checked" : "Insufficient evidence"}
              </span>
            )}
          </div>
          {displayAnswer ? (
            <div className="answer-content">
              <p>{displayAnswer.answer}</p>
              {displayAnswer.citations.map((citation) => (
                <blockquote key={citation.id}>
                  <p>“{citation.excerpt}”</p>
                  <Link href={`/notes/${citation.id}`}>
                    Read the source <ArrowUpRight size={13} />
                  </Link>
                </blockquote>
              ))}
            </div>
          ) : mode === "search" && sources.length ? (
            <div className="search-results">
              {sources.map((source) => (
                <Link href={source.url} key={source.id}>
                  <span className="eyebrow">{source.topic}</span>
                  <h3>
                    {source.title} <ArrowUpRight size={16} />
                  </h3>
                  <p>{source.description}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="answer-empty">
              <Search size={24} />
              <p>
                {running
                  ? "The agent is looking for evidence…"
                  : searched && mode === "search"
                    ? "No matching notes. Try concurrency, authorization, retrieval, or testing."
                    : "Start with a question. Follow the evidence."}
              </p>
            </div>
          )}
        </section>
        <details className="lab-inspector">
          <summary className="inspector-title">Sources & run details</summary>
          <div className="inspector-content">
            <div className="inspector-section">
              <span className="eyebrow">Tool activity</span>
              <ol className="trace-list">
                {displaySteps.map((step, index) => (
                  <li key={`${index}-${step.tool}`}>
                    <span className="trace-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <code>{step.tool}</code>
                      <p>{step.detail}</p>
                    </div>
                    <Check size={13} />
                  </li>
                ))}
              </ol>
              {!displaySteps.length && (
                <p className="small muted">
                  Tool activity appears here during a live run.
                </p>
              )}
            </div>
            <div className="inspector-section">
              <span className="eyebrow">Sources</span>
              {displaySources.length ? (
                displaySources.map((source) => (
                  <Link className="inspector-source" key={source.id} href={source.url}>
                    <BookOpen size={15} />
                    <span>{source.title}</span>
                    <ArrowUpRight size={14} />
                  </Link>
                ))
              ) : (
                <p className="small muted">
                  Published notes, selected for your question.
                </p>
              )}
            </div>
            <div className="inspector-section">
              <span className="eyebrow">Usage</span>
              <dl className="run-metrics">
                <div>
                  <dt>
                    <Clock3 size={13} />
                    Latency
                  </dt>
                  <dd>{usage ? `${(usage.latencyMs / 1000).toFixed(2)} s` : "—"}</dd>
                </div>
                <div>
                  <dt>Estimated cost</dt>
                  <dd>{usage ? `$${usage.estimatedCostUsd.toFixed(6)}` : "—"}</dd>
                </div>
                <div>
                  <dt>Input / output tokens</dt>
                  <dd>{usage ? `${usage.inputTokens} / ${usage.outputTokens}` : "—"}</dd>
                </div>
                <div>
                  <dt>Model requests</dt>
                  <dd>{usage ? `${usage.modelCalls} / 4` : "—"}</dd>
                </div>
              </dl>
              <p className="tiny muted">
                {mode === "example"
                  ? "Metrics are shown only for real API runs."
                  : "Token-based estimates exclude taxes. The monthly allowance is enforced server-side."}
              </p>
            </div>
          </div>
          <div className="lab-bottom mono">
            <span>
              <ShieldCheck size={14} />
              READ-ONLY TOOLS
            </span>
            <span>3 TOOL CALLS MAX</span>
            <span>30 SECOND DEADLINE</span>
            <span>$10 MONTHLY AI CAP</span>
          </div>
        </details>
      </div>
    </div>
  );
}
