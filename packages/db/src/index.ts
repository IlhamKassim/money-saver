import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { resolve } from "node:path";
import * as schema from "./schema";

// Default DB lives at <repo>/data/finance.db. This file is at <repo>/packages/db/src/index.ts.
const DB_PATH =
  process.env.DATABASE_URL ?? resolve(import.meta.dir, "../../../data/finance.db");

const sqlite = new Database(DB_PATH, { create: true });
sqlite.exec("PRAGMA journal_mode = WAL;");
sqlite.exec("PRAGMA foreign_keys = ON;");

export const db = drizzle(sqlite, { schema });
export { schema };
export type DB = typeof db;
