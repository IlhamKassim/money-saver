import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./_shared";
import { users } from "./users";

export const ACCOUNT_TYPES = [
  "checking",
  "savings",
  "credit",
  "investment",
  "loan",
  "cash",
  "other",
] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const accounts = sqliteTable(
  "accounts",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type", { enum: ACCOUNT_TYPES }).notNull(),
    institution: text("institution"),
    currency: text("currency").notNull().default("USD"),
    // Stored in minor units (cents). Null = unknown / not synced.
    currentBalance: integer("current_balance"),
    isArchived: integer("is_archived", { mode: "boolean" })
      .notNull()
      .default(false),
    ...timestamps,
  },
  (t) => ({
    userIdx: index("accounts_user_idx").on(t.userId),
  }),
);

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
