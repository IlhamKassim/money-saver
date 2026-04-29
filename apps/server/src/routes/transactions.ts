import { db, schema } from "@money-saver/db";
import {
  createTransactionSchema,
  listTransactionsQuerySchema,
} from "@money-saver/shared";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { Hono } from "hono";

export const transactionsRoutes = new Hono();

transactionsRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  const parsed = listTransactionsQuerySchema.safeParse(c.req.query());
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  const q = parsed.data;

  const conditions = [eq(schema.transactions.userId, userId)];
  if (q.accountId) conditions.push(eq(schema.transactions.accountId, q.accountId));
  if (q.categoryId) conditions.push(eq(schema.transactions.categoryId, q.categoryId));
  if (q.from) conditions.push(gte(schema.transactions.date, q.from));
  if (q.to) conditions.push(lte(schema.transactions.date, q.to));

  const rows = await db
    .select()
    .from(schema.transactions)
    .where(and(...conditions))
    .orderBy(desc(schema.transactions.date))
    .limit(q.limit);

  return c.json(rows);
});

transactionsRoutes.post("/", async (c) => {
  const userId = c.get("userId");
  const parsed = createTransactionSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  const [row] = await db
    .insert(schema.transactions)
    .values({ ...parsed.data, userId })
    .returning();
  return c.json(row, 201);
});

transactionsRoutes.get("/:id", async (c) => {
  const userId = c.get("userId");
  const [row] = await db
    .select()
    .from(schema.transactions)
    .where(
      and(
        eq(schema.transactions.id, c.req.param("id")),
        eq(schema.transactions.userId, userId),
      ),
    );
  if (!row) return c.json({ error: "not found" }, 404);
  return c.json(row);
});
