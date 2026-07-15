import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface UserPublic {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

const globalForDb = globalThis as typeof globalThis & {
  db?: Database.Database;
};

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL DEFAULT 'New chat',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    );
  `);

  const conversationColumns = db
    .prepare("PRAGMA table_info(conversations)")
    .all() as { name: string }[];

  if (!conversationColumns.some((column) => column.name === "agent_type")) {
    db.exec(`
      ALTER TABLE conversations
      ADD COLUMN agent_type TEXT NOT NULL DEFAULT 'general'
    `);
  }

  if (!conversationColumns.some((column) => column.name === "tones")) {
    db.exec(`
      ALTER TABLE conversations
      ADD COLUMN tones TEXT NOT NULL DEFAULT ''
    `);
  }
}

function createDatabase() {
  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });

  const db = new Database(path.join(dataDir, "app.db"));
  db.pragma("journal_mode = WAL");
  initSchema(db);

  return db;
}

export function getDb() {
  if (!globalForDb.db) {
    globalForDb.db = createDatabase();
  } else {
    initSchema(globalForDb.db);
  }

  return globalForDb.db;
}

export function findUserByEmail(email: string): User | undefined {
  return getDb()
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email.toLowerCase()) as User | undefined;
}

export function findUserById(id: number): UserPublic | undefined {
  return getDb()
    .prepare("SELECT id, name, email, created_at FROM users WHERE id = ?")
    .get(id) as UserPublic | undefined;
}

export function createUser(name: string, email: string, passwordHash: string) {
  const result = getDb()
    .prepare(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    )
    .run(name.trim(), email.toLowerCase(), passwordHash);

  return findUserById(Number(result.lastInsertRowid));
}
