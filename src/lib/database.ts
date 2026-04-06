import Database from "@tauri-apps/plugin-sql";

let db: Database | null = null;

/**
 * Get the SQLite database instance (singleton).
 * Creates and runs migrations on first call.
 */
export async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load("sqlite:app.db");
    await runMigrations(db);
  }
  return db;
}

/**
 * Run schema migrations. Add new migrations at the end.
 * Each migration is idempotent (uses IF NOT EXISTS).
 */
async function runMigrations(db: Database): Promise<void> {
  // Migration tracking table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const migrations: { name: string; sql: string }[] = [
    {
      name: "001_create_kv_store",
      sql: `CREATE TABLE IF NOT EXISTS kv_store (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
    },
    {
      name: "002_create_activity_log",
      sql: `CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        detail TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
    },
  ];

  for (const m of migrations) {
    const existing = await db.select<{ id: number }[]>(
      "SELECT id FROM _migrations WHERE name = ?",
      [m.name]
    );
    if (existing.length === 0) {
      await db.execute(m.sql);
      await db.execute("INSERT INTO _migrations (name) VALUES (?)", [m.name]);
    }
  }
}

/** Typed query helper. */
export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const database = await getDb();
  return database.select<T[]>(sql, params);
}

/** Execute a write statement. Returns the number of affected rows. */
export async function execute(
  sql: string,
  params: unknown[] = []
): Promise<{ rowsAffected: number; lastInsertId: number }> {
  const database = await getDb();
  const result = await database.execute(sql, params);
  return { rowsAffected: result.rowsAffected, lastInsertId: result.lastInsertId ?? 0 };
}
