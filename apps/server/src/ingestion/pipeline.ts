import { db, schema } from "@money-saver/db";
import { and, eq, inArray } from "drizzle-orm";
import { parseRobinhood } from "./parsers/robinhood";
import type { CanonicalTxn, ParserId, ParseResult } from "./types";

export type IngestSummary = {
  parsed: number;
  inserted: number;
  skipped: number; // duplicates already in DB
  errors: ParseResult["errors"];
  importBatchId: string;
};

const PARSERS: Record<ParserId, (content: string, opts: { accountId: string; currency?: string }) => Promise<ParseResult>> = {
  robinhood: parseRobinhood,
};

export const SUPPORTED_PARSERS: { id: ParserId; label: string }[] = [
  { id: "robinhood", label: "Robinhood — Account Activity CSV" },
];

export async function ingestCsv(args: {
  parserId: ParserId;
  content: string;
  accountId: string;
  userId: string;
  currency?: string;
}): Promise<IngestSummary> {
  const parser = PARSERS[args.parserId];
  if (!parser) throw new Error(`unknown parser: ${args.parserId}`);

  const { parsed, errors } = await parser(args.content, {
    accountId: args.accountId,
    currency: args.currency,
  });

  const importBatchId = crypto.randomUUID();

  // Pre-filter against rows already in the DB by import_hash.
  const existing = await findExistingHashes({
    userId: args.userId,
    hashes: parsed.map((p) => p.importHash),
  });

  const fresh = parsed.filter((p) => !existing.has(p.importHash));

  if (fresh.length > 0) {
    const rows = fresh.map((p) => toDbRow(p, args, importBatchId));
    await db.insert(schema.transactions).values(rows).onConflictDoNothing();
  }

  return {
    parsed: parsed.length,
    inserted: fresh.length,
    skipped: parsed.length - fresh.length,
    errors,
    importBatchId,
  };
}

async function findExistingHashes(args: { userId: string; hashes: string[] }): Promise<Set<string>> {
  if (args.hashes.length === 0) return new Set();
  const rows = await db
    .select({ importHash: schema.transactions.importHash })
    .from(schema.transactions)
    .where(
      and(
        eq(schema.transactions.userId, args.userId),
        inArray(schema.transactions.importHash, args.hashes),
      ),
    );
  return new Set(rows.map((r) => r.importHash).filter((h): h is string => h != null));
}

function toDbRow(
  txn: CanonicalTxn,
  args: { accountId: string; userId: string },
  importBatchId: string,
) {
  return {
    userId: args.userId,
    accountId: args.accountId,
    date: txn.date,
    amount: txn.amount,
    currency: txn.currency,
    description: txn.description,
    merchant: txn.merchant,
    notes: txn.notes,
    pending: txn.pending,
    importHash: txn.importHash,
    rawData: txn.rawData,
    importBatchId,
  };
}
