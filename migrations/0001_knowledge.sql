CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL,
  topic TEXT NOT NULL, url TEXT NOT NULL, content TEXT NOT NULL
);
CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(id UNINDEXED, title, description, content);
CREATE TABLE IF NOT EXISTS budget_months (
  month TEXT PRIMARY KEY,
  reserved_micros INTEGER NOT NULL DEFAULT 0 CHECK(reserved_micros >= 0),
  spent_micros INTEGER NOT NULL DEFAULT 0 CHECK(spent_micros >= 0)
);
CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY, month TEXT NOT NULL, amount_micros INTEGER NOT NULL,
  settled INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL
);
