import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./_shared";

export const users = sqliteTable("users", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").unique(),
  ...timestamps,
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
