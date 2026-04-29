import { db, schema } from "@money-saver/db";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

export const categoriesRoutes = new Hono();

categoriesRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  const rows = await db
    .select()
    .from(schema.categories)
    .where(eq(schema.categories.userId, userId));
  return c.json(rows);
});

// TODO: POST/PUT/DELETE handlers, plus tree-view helper for parent_id hierarchy.
