import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

export default class DatabaseInstance {
    private static db: BetterSQLite3Database;

    private constructor() {};

    public static getDBInstance(): BetterSQLite3Database{
       if(!this.db){
        const sqlite = new Database(process.env.DATABASE_NAME);
        this.db = drizzle(sqlite);
       }

       return this.db;
    }
}