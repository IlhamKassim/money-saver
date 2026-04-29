import { db, schema } from "@money-saver/db";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

export const budgetsRoutes = new Hono();

budgetsRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  const rows = await db
    .select()
    .from(schema.budgets)
    .where(eq(schema.budgets.userId, userId));
  return c.json(rows);
});

// TODO: GET /:id/progress — joins transactions, sums spend in window, returns remaining.
