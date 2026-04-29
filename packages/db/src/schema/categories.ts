import { AnySQLiteColumn, index, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./_shared";
import { users } from "./users";

export const CATEGORY_KINDS = ["income", "expense", "transfer"] as const;
export type CategoryKind = (typeof CATEGORY_KINDS)[number];

export const categories = sqliteTable(
  "categories",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    kind: text("kind", { enum: CATEGORY_KINDS }).notNull(),
    parentId: text("parent_id").references((): AnySQLiteColumn => categories.id, {
      onDelete: "set null",
    }),
    color: text("color"),
    icon: text("icon"),
    ...timestamps,
  },
  (t) => ({
    userIdx: index("categories_user_idx").on(t.userId),
    nameUnique: uniqueIndex("categories_user_name_unique").on(t.userId, t.name),
  }),
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
