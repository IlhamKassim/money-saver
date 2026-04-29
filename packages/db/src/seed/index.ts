import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { eq } from "drizzle-orm";
import { resolve } from "node:path";
import * as schema from "../schema";

const DB_PATH =
  process.env.DATABASE_URL ?? resolve(import.meta.dir, "../../../../data/finance.db");
const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID ?? "default-user";

const sqlite = new Database(DB_PATH, { create: true });
sqlite.exec("PRAGMA foreign_keys = ON;");
const db = drizzle(sqlite, { schema });

// Idempotent: insert-or-ignore on the default user, then top up missing categories.
db.insert(schema.users)
  .values({ id: DEFAULT_USER_ID, name: "Default" })
  .onConflictDoNothing()
  .run();

type SeedCategory = { name: string; kind: "income" | "expense" | "transfer" };

const STARTER_CATEGORIES: SeedCategory[] = [
  { name: "Salary", kind: "income" },
  { name: "Interest", kind: "income" },
  { name: "Dividends", kind: "income" },
  { name: "Refund", kind: "income" },

  { name: "Groceries", kind: "expense" },
  { name: "Restaurants", kind: "expense" },
  { name: "Transportation", kind: "expense" },
  { name: "Utilities", kind: "expense" },
  { name: "Rent", kind: "expense" },
  { name: "Subscriptions", kind: "expense" },
  { name: "Healthcare", kind: "expense" },
  { name: "Shopping", kind: "expense" },
  { name: "Entertainment", kind: "expense" },
  { name: "Travel", kind: "expense" },
  { name: "Investments", kind: "expense" },
  { name: "Fees", kind: "expense" },
  { name: "Uncategorized", kind: "expense" },

  { name: "Transfer", kind: "transfer" },
];

const existing = db
  .select({ name: schema.categories.name })
  .from(schema.categories)
  .where(eq(schema.categories.userId, DEFAULT_USER_ID))
  .all();
const existingNames = new Set(existing.map((r) => r.name));

const toInsert = STARTER_CATEGORIES.filter((c) => !existingNames.has(c.name)).map((c) => ({
  userId: DEFAULT_USER_ID,
  name: c.name,
  kind: c.kind,
}));

if (toInsert.length > 0) {
  db.insert(schema.categories).values(toInsert).run();
}

console.log(
  `seeded → user=${DEFAULT_USER_ID}, categories inserted=${toInsert.length}, already present=${existingNames.size}`,
);
sqlite.close();
