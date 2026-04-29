import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./_shared";
import { categories } from "./categories";
import { users } from "./users";

export const BUDGET_PERIODS = ["weekly", "monthly", "quarterly", "yearly"] as const;
export type BudgetPeriod = (typeof BUDGET_PERIODS)[number];

export const budgets = sqliteTable(
  "budgets",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),

    // Cap in minor units for the given period.
    amount: integer("amount").notNull(),
    currency: text("currency").notNull().default("USD"),
    period: text("period", { enum: BUDGET_PERIODS }).notNull(),

    startDate: text("start_date").notNull(),
    endDate: text("end_date"),

    ...timestamps,
  },
  (t) => ({
    userIdx: index("budgets_user_idx").on(t.userId),
    categoryUnique: uniqueIndex("budgets_user_category_period_unique").on(
      t.userId,
      t.categoryId,
      t.period,
      t.startDate,
    ),
  }),
);

export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;
