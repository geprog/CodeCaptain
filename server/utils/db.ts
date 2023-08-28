import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate as _migrate } from 'drizzle-orm/better-sqlite3/migrator';

// @ts-ignore
import Database from 'better-sqlite3';

const config = useRuntimeConfig();
const sqlite = new Database(config.db.path);

export const db: BetterSQLite3Database = drizzle(sqlite);
