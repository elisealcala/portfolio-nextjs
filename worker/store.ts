import type { D1Database } from "@cloudflare/workers-types";
import {
  MONTHLY_BUDGET_MICROS,
  RUN_RESERVATION_MICROS,
  type NoteSource,
  type SearchResult,
} from "../src/lib/explorer-contract";

export function ftsQuery(query: string): string {
  const terms = query.match(/[\p{L}\p{N}]{2,}/gu)?.slice(0, 12) ?? [];
  return terms.map((term) => `"${term.replaceAll('"', '""')}"`).join(" OR ");
}

export class KnowledgeStore {
  constructor(readonly db: D1Database) {}

  async search(query: string): Promise<SearchResult[]> {
    const match = ftsQuery(query);
    if (!match) return [];
    const { results } = await this.db
      .prepare(
        `SELECT n.id,n.title,n.description,n.topic,n.url,
      substr(n.content,1,240) AS excerpt FROM notes_fts f JOIN notes n ON n.id=f.id
      WHERE notes_fts MATCH ? ORDER BY bm25(notes_fts,0,5,3,1) LIMIT 5`
      )
      .bind(match)
      .all<SearchResult>();
    return results;
  }

  async read(id: string): Promise<NoteSource | null> {
    return this.db
      .prepare("SELECT id,title,description,topic,url,content FROM notes WHERE id=?")
      .bind(id)
      .first<NoteSource>();
  }

  async reserve(id: string, month: string): Promise<boolean> {
    // D1 batch is a transaction. The conditional insert and increment cannot race.
    const result = await this.db.batch([
      this.db
        .prepare("INSERT OR IGNORE INTO budget_months (month) VALUES (?)")
        .bind(month),
      this.db
        .prepare(
          `INSERT INTO reservations (id,month,amount_micros)
        SELECT ?,month,? FROM budget_months WHERE month=? AND spent_micros+reserved_micros+?<=?`
        )
        .bind(
          id,
          RUN_RESERVATION_MICROS,
          month,
          RUN_RESERVATION_MICROS,
          MONTHLY_BUDGET_MICROS
        ),
      this.db
        .prepare(
          `UPDATE budget_months SET reserved_micros=reserved_micros+?
        WHERE month=? AND EXISTS (SELECT 1 FROM reservations WHERE id=? AND settled=0)`
        )
        .bind(RUN_RESERVATION_MICROS, month, id),
    ]);
    return result[1].meta.changes === 1;
  }

  async settle(id: string, actualMicros: number | null): Promise<void> {
    const amount =
      actualMicros === null
        ? RUN_RESERVATION_MICROS
        : Math.max(0, Math.ceil(actualMicros));
    if (!Number.isSafeInteger(amount) || amount > RUN_RESERVATION_MICROS) {
      throw new Error("Usage exceeded the reserved envelope; retain reservation");
    }
    await this.db.batch([
      this.db
        .prepare(
          `UPDATE budget_months SET
        reserved_micros=reserved_micros-(SELECT amount_micros FROM reservations WHERE id=?),
        spent_micros=spent_micros+?
        WHERE month=(SELECT month FROM reservations WHERE id=? AND settled=0)`
        )
        .bind(id, amount, id),
      this.db
        .prepare("UPDATE reservations SET settled=1 WHERE id=? AND settled=0")
        .bind(id),
    ]);
  }

  async allowRate(key: string, now: number, evaluation = false): Promise<boolean> {
    const limits = evaluation
      ? [{ key: `eval:${Math.floor(now / 86400)}`, max: 60, ttl: 86400 }]
      : [
          { key: `minute:${key}:${Math.floor(now / 60)}`, max: 3, ttl: 60 },
          { key: `day:${key}:${Math.floor(now / 86400)}`, max: 20, ttl: 86400 },
          { key: `global:${Math.floor(now / 86400)}`, max: 200, ttl: 86400 },
        ];
    const results = await this.db.batch([
      this.db.prepare("DELETE FROM rate_limits WHERE expires_at<?").bind(now),
      ...limits.map((limit) =>
        this.db
          .prepare(
            `INSERT INTO rate_limits (key,count,expires_at) VALUES (?,1,?)
        ON CONFLICT(key) DO UPDATE SET count=count+1 WHERE count<? RETURNING count`
          )
          .bind(limit.key, now + limit.ttl, limit.max)
      ),
    ]);
    return results.slice(1).every((result) => result.results.length === 1);
  }
}
