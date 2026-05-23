interface Migration {
  id: string
  statements: string[]
}

const MIGRATIONS: Migration[] = [
  {
    id: '0001_init_d1',
    statements: [
      `CREATE TABLE IF NOT EXISTS links (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        slug TEXT NOT NULL,
        comment TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        expiration INTEGER,
        starts_at INTEGER,
        title TEXT,
        description TEXT,
        image TEXT,
        apple TEXT,
        google TEXT,
        cloaking BOOLEAN DEFAULT 0,
        redirect_with_query BOOLEAN DEFAULT 0,
        password TEXT,
        unsafe BOOLEAN DEFAULT 0,
        tags TEXT,
        folder TEXT
      )`,
      'CREATE INDEX IF NOT EXISTS idx_links_slug ON links(slug)',
      'CREATE INDEX IF NOT EXISTS idx_links_folder ON links(folder)',
      'CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at)',
    ],
  },
  {
    id: '0002_add_url_index',
    statements: [
      'CREATE INDEX IF NOT EXISTS idx_links_url ON links(url)',
    ],
  },
  {
    id: '0003_metadata_tables',
    statements: [
      `CREATE TABLE IF NOT EXISTS folders_metadata (
        name TEXT PRIMARY KEY,
        color TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS tags_metadata (
        name TEXT PRIMARY KEY,
        color TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`,
    ],
  },
]

interface D1Result {
  results: { id: string }[]
}

interface D1Stmt {
  bind: (...args: (string | number)[]) => D1Stmt
  run: () => Promise<unknown>
  all: () => Promise<D1Result>
}

interface D1DB {
  prepare: (sql: string) => D1Stmt
}

let applied = false

export async function ensureMigrations(db: unknown): Promise<void> {
  if (applied)
    return

  if (!db)
    return

  try {
    const d1 = db as D1DB
    await d1.prepare(
      'CREATE TABLE IF NOT EXISTS _migrations (id TEXT PRIMARY KEY, applied_at INTEGER NOT NULL)',
    ).run()

    const { results } = await d1.prepare('SELECT id FROM _migrations').all()
    const appliedIds = new Set(results.map(r => r.id))

    for (const migration of MIGRATIONS) {
      if (appliedIds.has(migration.id))
        continue

      console.log(`[auto-migrate] Applying ${migration.id}...`)
      for (const stmt of migration.statements) {
        await d1.prepare(stmt).run()
      }
      await d1.prepare(
        'INSERT INTO _migrations (id, applied_at) VALUES (?, ?)',
      ).bind(migration.id, Math.floor(Date.now() / 1000)).run()
      console.log(`[auto-migrate] Applied ${migration.id}`)
    }

    applied = true
  }
  catch (e) {
    console.error('[auto-migrate] Failed to run migrations:', e)
  }
}
