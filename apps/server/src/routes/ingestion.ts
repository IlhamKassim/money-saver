import { Hono } from "hono";

export const ingestionRoutes = new Hono();

// POST /ingestion/csv
//   multipart upload: file + accountId + parserId (e.g. "chase", "amex", "robinhood").
//   Pipeline: parse → normalize → dedupe (import_hash) → insert → return { imported, skipped, errors }.
ingestionRoutes.post("/csv", async (c) => {
  return c.json({ error: "not implemented" }, 501);
});

// GET /ingestion/parsers — discoverable list of supported bank parsers for the UI dropdown.
ingestionRoutes.get("/parsers", (c) => {
  return c.json({ parsers: [] });
});
