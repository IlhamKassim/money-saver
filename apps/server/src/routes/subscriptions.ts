import { db, schema } from "@money-saver/db";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

export const subscriptionsRoutes = new Hono();

subscriptionsRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  const rows = await db
    .select()
    .from(schema.subscriptions)
    .where(eq(schema.subscriptions.userId, userId));
  return c.json(rows);
});

// TODO: detection job that scans transactions for recurring merchant/amount patterns.
