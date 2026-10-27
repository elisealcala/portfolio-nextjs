import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { KnowledgeStore, ftsQuery } from "../worker/store";
import {
  MONTHLY_BUDGET_MICROS,
  RUN_RESERVATION_MICROS,
} from "../src/lib/explorer-contract";
import { SQLiteD1 } from "./helpers/sqlite-d1";
import { note } from "./helpers/fixtures";

describe("KnowledgeStore against SQLite", () => {
  let database: SQLiteD1;
  let store: KnowledgeStore;
  const month = "2026-10";

  beforeEach(() => {
    database = new SQLiteD1();
    store = new KnowledgeStore(database.asD1());
  });
  afterEach(() => database.close());

  function budget() {
    return database.sqlite
      .prepare("SELECT reserved_micros,spent_micros FROM budget_months WHERE month=?")
      .get(month);
  }

  it("admits only one concurrent reservation when one envelope remains", async () => {
    database.sqlite
      .prepare("INSERT INTO budget_months (month,spent_micros) VALUES (?,?)")
      .run(month, MONTHLY_BUDGET_MICROS - RUN_RESERVATION_MICROS);
    const admitted = await Promise.all(
      Array.from({ length: 20 }, (_, index) => store.reserve(`run-${index}`, month))
    );
    expect(admitted.filter(Boolean)).toHaveLength(1);
    expect(budget()).toMatchObject({
      reserved_micros: RUN_RESERVATION_MICROS,
      spent_micros: MONTHLY_BUDGET_MICROS - RUN_RESERVATION_MICROS,
    });
    expect(
      database.sqlite.prepare("SELECT count(*) AS count FROM reservations").get()?.count
    ).toBe(1);
  });

  it("atomically rolls back a failed duplicate reservation", async () => {
    await store.reserve("same-id", month);
    await expect(store.reserve("same-id", month)).rejects.toThrow();
    expect(budget()).toMatchObject({
      reserved_micros: RUN_RESERVATION_MICROS,
      spent_micros: 0,
    });
  });

  it("releases unused allowance once, even when settlement is repeated concurrently", async () => {
    await store.reserve("run", month);
    await Promise.all([
      store.settle("run", 127),
      store.settle("run", 127),
      store.settle("run", 0),
    ]);
    expect(budget()).toMatchObject({ reserved_micros: 0, spent_micros: 127 });
    expect(
      database.sqlite.prepare("SELECT settled FROM reservations WHERE id='run'").get()
        ?.settled
    ).toBe(1);
  });

  it("charges the full envelope when provider usage is unknown", async () => {
    await store.reserve("interrupted", month);
    await store.settle("interrupted", null);
    await store.settle("interrupted", 0);
    expect(budget()).toMatchObject({
      reserved_micros: 0,
      spent_micros: RUN_RESERVATION_MICROS,
    });
  });

  it("keeps the reservation if reported usage exceeds its envelope", async () => {
    await store.reserve("unexpected-usage", month);
    await expect(
      store.settle("unexpected-usage", RUN_RESERVATION_MICROS + 1)
    ).rejects.toThrow("envelope");
    expect(budget()).toMatchObject({
      reserved_micros: RUN_RESERVATION_MICROS,
      spent_micros: 0,
    });
  });

  it("settles into the reservation month even after the calendar changes", async () => {
    await store.reserve("october", month);
    await store.reserve("november", "2026-11");
    await store.settle("october", 73);
    expect(budget()).toMatchObject({ reserved_micros: 0, spent_micros: 73 });
    expect(
      database.sqlite
        .prepare(
          "SELECT reserved_micros,spent_micros FROM budget_months WHERE month='2026-11'"
        )
        .get()
    ).toMatchObject({ reserved_micros: RUN_RESERVATION_MICROS, spent_micros: 0 });
  });

  it("does not bypass the monthly allowance for evaluation traffic", async () => {
    database.sqlite
      .prepare("INSERT INTO budget_months (month,spent_micros) VALUES (?,?)")
      .run(month, MONTHLY_BUDGET_MICROS);
    expect(await store.allowRate("evaluator", 100, true)).toBe(true);
    expect(await store.reserve("evaluation", month)).toBe(false);
  });

  it("enforces per-minute, per-day, and evaluator request limits", async () => {
    expect(await store.allowRate("visitor", 10)).toBe(true);
    expect(await store.allowRate("visitor", 11)).toBe(true);
    expect(await store.allowRate("visitor", 12)).toBe(true);
    expect(await store.allowRate("visitor", 13)).toBe(false);
    expect(await store.allowRate("visitor", 70)).toBe(true);
    for (let index = 0; index < 60; index++)
      expect(await store.allowRate("evaluation", 80, true)).toBe(true);
    expect(await store.allowRate("evaluation", 81, true)).toBe(false);
  });

  it("keeps the daily visitor limit across minute buckets and resets the next day", async () => {
    for (let index = 0; index < 20; index++)
      expect(await store.allowRate("daily-visitor", index * 61)).toBe(true);
    expect(await store.allowRate("daily-visitor", 20 * 61)).toBe(false);
    expect(await store.allowRate("daily-visitor", 86_401)).toBe(true);
  });

  it("enforces the shared daily visitor limit across different visitors", async () => {
    for (let index = 0; index < 200; index++)
      expect(await store.allowRate(`visitor-${index}`, 100)).toBe(true);
    expect(await store.allowRate("visitor-201", 100)).toBe(false);
  });

  it("executes sanitized full-text search and returns only public note data", async () => {
    database.sqlite
      .prepare(
        "INSERT INTO notes (id,title,description,topic,url,content) VALUES (?,?,?,?,?,?)"
      )
      .run(note.id, note.title, note.description, note.topic, note.url, note.content);
    database.sqlite
      .prepare("INSERT INTO notes_fts (id,title,description,content) VALUES (?,?,?,?)")
      .run(note.id, note.title, note.description, note.content);
    expect(await store.search('edits" OR document:* --')).toEqual([
      expect.objectContaining({ id: note.id, url: note.url }),
    ]);
    expect(await store.search("?!*")).toEqual([]);
    expect(await store.read(note.id)).toEqual(note);
    expect(await store.read("../private-vault")).toBeNull();
    expect(
      database.sqlite.prepare("SELECT count(*) AS count FROM notes").get()?.count
    ).toBe(1);
  });
});

describe("ftsQuery", () => {
  it("quotes words instead of accepting user-supplied FTS syntax", () => {
    expect(ftsQuery('title:foo* OR "bar" -baz')).toBe(
      '"title" OR "foo" OR "OR" OR "bar" OR "baz"'
    );
    expect(ftsQuery("a ! * ?")).toBe("");
    expect(ftsQuery("authorization autorización")).toBe(
      '"authorization" OR "autorización"'
    );
    expect(ftsQuery(Array(30).fill("word").join(" ")).split(" OR ")).toHaveLength(12);
  });
});
