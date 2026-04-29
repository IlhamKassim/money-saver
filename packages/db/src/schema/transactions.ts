import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./_shared";
import { accounts } from "./accounts";
import { categories } from "./categories";
import { users } from "./users";

export const transactions = sqliteTable(
  "transactions",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    categoryId: text("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),

    // Posted date as YYYY-MM-DD (TEXT) — keeps date-only semantics, sorts lexicographically.
    date: text("date").notNull(),

    // Signed minor units. Negative = outflow, positive = inflow.
    amount: integer("amount").notNull(),
    currency: text("currency").notNull().default("USD"),

    description: text("description").notNull(),
    merchant: text("merchant"),
    notes: text("notes"),
    pending: integer("pending", { mode: "boolean" }).notNull().default(false),

    // Stable hash of (account_id, date, amount, normalized description) — used for dedup on re-import.
    importHash: text("import_hash"),
    // Original CSV row preserved as JSON so we can re-normalize if rules change.
    rawData: text("raw_data", { mode: "json" }),
    importBatchId: text("import_batch_id"),

    ...timestamps,
  },
  (t) => ({
    userIdx: index("transactions_user_idx").on(t.userId),
    accountIdx: index("transactions_account_idx").on(t.accountId),
    dateIdx: index("transactions_date_idx").on(t.date),
    categoryIdx: index("transactions_category_idx").on(t.categoryId),
    importHashUnique: uniqueIndex("transactions_user_import_hash_unique").on(
      t.userId,
      t.importHash,
    ),
  }),
);

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
