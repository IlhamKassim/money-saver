import { Hono } from "hono";
import { z } from "zod";
import { ingestCsv, SUPPORTED_PARSERS } from "../ingestion/pipeline";

export const ingestionRoutes = new Hono();

ingestionRoutes.get("/parsers", (c) => {
  return c.json({ parsers: SUPPORTED_PARSERS });
});

const csvFormSchema = z.object({
  parserId: z.enum(["robinhood"]),
  accountId: z.string().uuid(),
  currency: z.string().length(3).optional(),
});

// POST /api/ingestion/csv
//   multipart/form-data: file=<csv>, parserId=robinhood, accountId=<uuid>, currency?=USD
ingestionRoutes.post("/csv", async (c) => {
  const userId = c.get("userId");

  let form: FormData;
  try {
    form = await c.req.formData();
  } catch {
    return c.json({ error: "expected multipart/form-data" }, 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return c.json({ error: "missing 'file' field" }, 400);
  }

  const fields = csvFormSchema.safeParse({
    parserId: form.get("parserId"),
    accountId: form.get("accountId"),
    currency: form.get("currency") ?? undefined,
  });
  if (!fields.success) {
    return c.json({ error: fields.error.flatten() }, 400);
  }

  const content = await file.text();
  const summary = await ingestCsv({
    parserId: fields.data.parserId,
    accountId: fields.data.accountId,
    currency: fields.data.currency,
    userId,
    content,
  });

  return c.json(summary);
});
