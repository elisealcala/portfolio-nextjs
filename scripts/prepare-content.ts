import fs from "node:fs";
import { getArticles } from "../src/lib/content";
import type { NoteSource } from "../src/lib/explorer-contract";

// Only reviewed, repository-owned notes are eligible; no Obsidian path is read.
const notes: NoteSource[] = getArticles("notes").map((note) => ({
  id: note.slug,
  title: note.title,
  description: note.description,
  topic: note.topic,
  url: `/notes/${note.slug}`,
  content: note.content.trim(),
}));
getArticles("posts");
const quote = (value: string) => `'${value.replaceAll("'", "''")}'`;
const sql = ["DELETE FROM notes_fts;", "DELETE FROM notes;"];
for (const n of notes) {
  sql.push(
    `INSERT INTO notes (id,title,description,topic,url,content) VALUES (${[n.id, n.title, n.description, n.topic, n.url, n.content].map(quote).join(",")});`
  );
  sql.push(
    `INSERT INTO notes_fts (id,title,description,content) VALUES (${[n.id, n.title, n.description, n.content].map(quote).join(",")});`
  );
}
fs.mkdirSync(".generated", { recursive: true });
fs.mkdirSync("public", { recursive: true });
fs.writeFileSync(".generated/seed.sql", sql.join("\n"));
fs.writeFileSync("public/knowledge.json", JSON.stringify(notes));
console.log(`Prepared ${notes.length} public notes and validated the archive.`);
