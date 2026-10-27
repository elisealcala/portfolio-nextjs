import fs from "node:fs";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import type { D1Database } from "@cloudflare/workers-types";

type Row = Record<string, unknown>;

class SQLiteStatement {
  constructor(
    private readonly database: DatabaseSync,
    private readonly sql: string,
    private readonly values: SQLInputValue[] = []
  ) {}

  bind(...values: SQLInputValue[]) {
    return new SQLiteStatement(this.database, this.sql, values);
  }

  execute() {
    const statement = this.database.prepare(this.sql);
    const results: Row[] = statement.columns().length
      ? statement.all(...this.values).map((row) => ({ ...row }))
      : (statement.run(...this.values), []);
    const changes = this.database.prepare("SELECT changes() AS value").get()!.value;
    return { success: true, results, meta: { changes: Number(changes) } };
  }

  async first<T = Row>(column?: string): Promise<T | null> {
    const row = this.database.prepare(this.sql).get(...this.values);
    return row ? ((column ? row[column] : { ...row }) as T) : null;
  }

  async all<T = Row>() {
    return this.execute() as { success: true; results: T[]; meta: { changes: number } };
  }

  async run() {
    return this.execute();
  }
}

/** Uses the real migration, constraints, conditional writes, FTS5, and transactions. */
export class SQLiteD1 {
  readonly sqlite = new DatabaseSync(":memory:");

  constructor() {
    this.sqlite.exec(fs.readFileSync("migrations/0001_knowledge.sql", "utf8"));
  }

  prepare(sql: string) {
    return new SQLiteStatement(this.sqlite, sql);
  }

  async batch(statements: SQLiteStatement[]) {
    this.sqlite.exec("BEGIN IMMEDIATE");
    try {
      const results = statements.map((statement) => statement.execute());
      this.sqlite.exec("COMMIT");
      return results;
    } catch (error) {
      this.sqlite.exec("ROLLBACK");
      throw error;
    }
  }

  asD1() {
    // Only the D1 methods exercised by production code are adapted here.
    return this as unknown as D1Database;
  }

  close() {
    this.sqlite.close();
  }
}
