import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from './schema';
import Database from 'better-sqlite3';

const DATABASE_PATH = `${__dirname}/../bin/sqlite.db`;

export class Drizzle {
    public database = null as null | BetterSQLite3Database<Record<string, unknown>> | BetterSQLite3Database<typeof schema>;

    constructor(){
        this.start();
    }

    private start() {
        const sqlite = new Database(DATABASE_PATH);
        this.database = drizzle(sqlite, { schema }) as BetterSQLite3Database<typeof schema>;
        migrate(this.database, { migrationsFolder: `${__dirname}/migrations` });
        return;
    }

    public db() : BetterSQLite3Database<typeof schema> {
        return this.database as BetterSQLite3Database<typeof schema>;
    }
}
