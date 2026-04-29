import { db, schema } from "@money-saver/db";
import { createAccountSchema } from "@money-saver/shared";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";

export const accountsRoutes = new Hono();

accountsRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  const rows = await db
    .select()
    .from(schema.accounts)
    .where(eq(schema.accounts.userId, userId));
  return c.json(rows);
});

accountsRoutes.post("/", async (c) => {
  const userId = c.get("userId");
  const parsed = createAccountSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  const [row] = await db
    .insert(schema.accounts)
    .values({ ...parsed.data, userId })
    .returning();
  return c.json(row, 201);
});

accountsRoutes.get("/:id", async (c) => {
  const userId = c.get("userId");
  const [row] = await db
    .select()
    .from(schema.accounts)
    .where(and(eq(schema.accounts.id, c.req.param("id")), eq(schema.accounts.userId, userId)));
  if (!row) return c.json({ error: "not found" }, 404);
  return c.json(row);
});

accountsRoutes.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const result = await db
    .delete(schema.accounts)
    .where(and(eq(schema.accounts.id, c.req.param("id")), eq(schema.accounts.userId, userId)));
  return c.json({ deleted: result.rowsAffected ?? 0 });
});
