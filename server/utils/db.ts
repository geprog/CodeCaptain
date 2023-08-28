import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate as _migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';

// @ts-ignore
import Database from 'better-sqlite3';

const sqlite = new Database(path.join(process.env.DATA_PATH || 'data', 'code_captain.db'));

export const db: BetterSQLite3Database = drizzle(sqlite);
