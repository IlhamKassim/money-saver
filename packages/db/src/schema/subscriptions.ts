import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./_shared";
import { accounts } from "./accounts";
import { categories } from "./categories";
import { users } from "./users";

export const SUBSCRIPTION_CADENCES = [
  "weekly",
  "biweekly",
  "monthly",
  "quarterly",
  "yearly",
  "custom",
] as const;
export type SubscriptionCadence = (typeof SUBSCRIPTION_CADENCES)[number];

export const subscriptions = sqliteTable(
  "subscriptions",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id").references(() => accounts.id, {
      onDelete: "set null",
    }),
    categoryId: text("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),

    merchant: text("merchant").notNull(),
    // Minor units, positive number representing the recurring charge.
    amount: integer("amount").notNull(),
    currency: text("currency").notNull().default("USD"),

    cadence: text("cadence", { enum: SUBSCRIPTION_CADENCES }).notNull(),
    // Days between charges, only used when cadence = 'custom'.
    customIntervalDays: integer("custom_interval_days"),

    nextBillingDate: text("next_billing_date"),
    lastChargedDate: text("last_charged_date"),

    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    notes: text("notes"),

    ...timestamps,
  },
  (t) => ({
    userIdx: index("subscriptions_user_idx").on(t.userId),
    nextBillingIdx: index("subscriptions_next_billing_idx").on(t.nextBillingDate),
  }),
);

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
