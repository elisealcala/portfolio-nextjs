import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { formatDate, getArticle, getArticles } from "../src/lib/content";
import { localSearch } from "../src/lib/explorer-contract";

const legacySlugs = [
  "boost-your-productivity-with-apollo-hooks-and-typescript",
  "component-library-storybook-tailwind",
  "context-use-reducer-typescript",
  "how-to-use-graphql-fragments",
  "lets-talk-about-estimation",
  "start-a-new-electron-app-with-react-and-typescript",
  "start-your-new-react-project",
  "tips-write-better-react-components",
  "what-is-the-jamstack",
];
const noteSlugs = [
  "delegated-authorization",
  "optimistic-concurrency",
  "persistence-testing",
  "retrieval-tradeoffs",
  "service-boundaries",
  "validating-ai-tool-calls",
];

describe("public content and archive", () => {
  const temporaryRoots: string[] = [];
  afterEach(() => {
    vi.restoreAllMocks();
    for (const root of temporaryRoots.splice(0))
      fs.rmSync(root, { recursive: true, force: true });
  });

  function fixtures(
    entries: { filename: string; metadata: string }[],
    collection: "posts" | "notes" = "notes"
  ) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-content-"));
    temporaryRoots.push(root);
    const folder = path.join(
      root,
      collection === "posts" ? "outstatic/content/posts" : "content/notes"
    );
    fs.mkdirSync(folder, { recursive: true });
    for (const { filename, metadata } of entries)
      fs.writeFileSync(
        path.join(folder, filename),
        `---\n${metadata}\n---\nA readable public idea.\n`
      );
    vi.spyOn(process, "cwd").mockReturnValue(root);
  }

  function fixture(filename: string, metadata: string) {
    fixtures([{ filename, metadata }]);
  }

  function datedArticle(slug: string, publishedAt: string, updatedAt?: string) {
    return {
      filename: `${slug}.md`,
      metadata: [
        `title: ${slug}`,
        "description: A working idea",
        `slug: ${slug}`,
        `publishedAt: ${publishedAt}`,
        ...(updatedAt ? [`updatedAt: ${updatedAt}`] : []),
        "status: published",
        "kind: idea",
      ].join("\n"),
    };
  }

  it("preserves all nine legacy article URLs and their 2020 dates", () => {
    const posts = getArticles("posts");
    expect(posts.map((post) => post.slug).sort()).toEqual(legacySlugs);
    for (const post of posts) {
      expect(post.publishedAt.startsWith("2020-")).toBe(true);
      expect(getArticle("posts", post.slug)?.content).toBe(post.content);
      expect(post.content.length).toBeGreaterThan(100);
      expect(post.minutes).toBeGreaterThan(0);
    }
    expect(posts.map((post) => post.publishedAt)).toEqual(
      [...posts.map((post) => post.publishedAt)].sort().reverse()
    );
  });

  it("publishes dated working ideas at the existing public URLs without private source details", () => {
    const notes = getArticles("notes");
    expect(notes.map((note) => note.slug).sort()).toEqual(noteSlugs);
    for (const note of notes) {
      expect(note.kind).toBe("idea");
      expect(Number.isFinite(Date.parse(note.publishedAt))).toBe(true);
      expect(note.updatedAt).toBeDefined();
      expect(Date.parse(note.updatedAt!)).toBeGreaterThanOrEqual(
        Date.parse(note.publishedAt)
      );
      expect(JSON.stringify(note)).not.toMatch(
        /\/Users\/|Sites\/obsidian|School\s*AI|POW-\d|SAI-\d|AP-\d/i
      );
    }
    expect(getArticle("notes", "../../knowledge/private")).toBeUndefined();
  });

  it("surfaces recently updated notes while falling back to publication dates", () => {
    fixtures([
      datedArticle("older-idea", "2026-06-01", "2026-10-27"),
      datedArticle("new-idea", "2026-10-26"),
      datedArticle("untouched-idea", "2026-07-01"),
    ]);

    const notes = getArticles("notes");
    expect(notes.map((note) => note.slug)).toEqual([
      "older-idea",
      "new-idea",
      "untouched-idea",
    ]);
    expect(notes[0].publishedAt).toBe("2026-06-01T00:00:00.000Z");
    expect(notes[0].updatedAt).toBe("2026-10-27T00:00:00.000Z");
    expect(notes[1].updatedAt).toBeUndefined();
  });

  it("keeps tied note dates in a stable order", () => {
    fixtures([
      datedArticle("zebra", "2026-10-22", "2026-10-27"),
      datedArticle("alpha", "2026-10-27"),
    ]);
    expect(getArticles("notes").map((note) => note.slug)).toEqual(["alpha", "zebra"]);
  });

  it("keeps archive ordering tied to original publication even after an update", () => {
    fixtures(
      [
        datedArticle("early-post", "2020-03-13", "2026-10-27"),
        datedArticle("later-post", "2020-08-01"),
      ],
      "posts"
    );
    const posts = getArticles("posts");
    expect(posts.map((post) => post.slug)).toEqual(["later-post", "early-post"]);
    expect(posts[1].publishedAt).toBe("2020-03-13T00:00:00.000Z");
  });

  it("normalizes offset timestamps and permits an update at the publication instant", () => {
    fixtures([
      datedArticle(
        "same-instant",
        "2026-10-22T00:00:00Z",
        "2026-10-21T19:00:00-05:00"
      ),
    ]);
    const [note] = getArticles("notes");
    expect(note.updatedAt).toBe("2026-10-22T00:00:00.000Z");
    expect(note.updatedAt).toBe(note.publishedAt);
  });

  it.each([
    ["2026-02-30", undefined],
    ["10/22/2026", undefined],
    ["2026-10-22", "2026-13-01"],
    ["2026-10-22", "not-a-date"],
  ] as const)("rejects invalid date metadata (%s, %s)", (publishedAt, updatedAt) => {
    fixtures([datedArticle("invalid-date", publishedAt, updatedAt)]);
    expect(() => getArticles("notes")).toThrow();
  });

  it("rejects an update that precedes publication", () => {
    fixtures([datedArticle("backdated-update", "2026-10-22", "2026-10-21")]);
    expect(() => getArticles("notes")).toThrow("Update date cannot precede publication");
  });

  it("excludes drafts from the public collection", () => {
    fixture(
      "draft.md",
      "title: Draft\ndescription: Not ready\nslug: draft\npublishedAt: 2026-10-22\nstatus: draft"
    );
    expect(getArticles("notes")).toEqual([]);
  });

  it("rejects incomplete metadata instead of publishing broken articles", () => {
    fixture("incomplete.md", "title: Missing other fields");
    expect(() => getArticles("notes")).toThrow();
  });

  it("rejects a slug that would unexpectedly change the file's URL", () => {
    fixture(
      "original.md",
      "title: Test\ndescription: Test description\nslug: changed\npublishedAt: 2026-10-22\nstatus: published"
    );
    expect(() => getArticles("notes")).toThrow("Slug differs from filename");
  });

  it("formats dates in UTC without shifting the archive publication day", () => {
    expect(formatDate("2020-03-13T00:00:00.000Z")).toBe("Mar 13, 2020");
  });

  it("keeps browser search available over the curated notes without a model", () => {
    const corpus = getArticles("notes").map((article) => ({
      id: article.slug,
      title: article.title,
      description: article.description,
      topic: article.topic,
      url: `/notes/${article.slug}`,
      content: article.content,
    }));
    expect(
      localSearch(corpus, "optimistic concurrency").map((result) => result.id)
    ).toContain("optimistic-concurrency");
    expect(localSearch(corpus, "authorization").map((result) => result.id)).toContain(
      "delegated-authorization"
    );
    expect(localSearch(corpus, "zzzzunmatchedterm")).toEqual([]);
    expect(localSearch(corpus, " ")).toEqual([]);
    expect(localSearch(corpus, "the").length).toBeLessThanOrEqual(5);
    expect(localSearch(corpus, "concurrency")[0]).not.toHaveProperty("content");
  });
});
