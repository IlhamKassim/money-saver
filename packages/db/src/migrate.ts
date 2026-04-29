import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

const DB_PATH = process.env.DATABASE_URL ?? "../../data/finance.db";

const sqlite = new Database(DB_PATH, { create: true });
sqlite.exec("PRAGMA journal_mode = WAL;");
sqlite.exec("PRAGMA foreign_keys = ON;");

const db = drizzle(sqlite);

migrate(db, { migrationsFolder: "./src/migrations" });
console.log(`migrations applied → ${DB_PATH}`);
sqlite.close();
