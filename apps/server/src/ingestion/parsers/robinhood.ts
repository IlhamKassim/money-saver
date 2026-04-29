import Papa from "papaparse";
import type { CanonicalTxn, ParseOptions, ParseResult } from "../types";
import { computeImportHash, parseDollarAmount, parseUSDate } from "../utils";

// Robinhood "Account Activity" CSV header (current public export format).
// If your CSV differs, add the variant to ALIASES rather than editing in place.
type RawRow = {
  "Activity Date"?: string;
  "Process Date"?: string;
  "Settle Date"?: string;
  Instrument?: string;
  Description?: string;
  "Trans Code"?: string;
  Quantity?: string;
  Price?: string;
  Amount?: string;
};

const ALIASES: Record<string, keyof RawRow> = {
  "activity date": "Activity Date",
  "process date": "Process Date",
  "settle date": "Settle Date",
  instrument: "Instrument",
  description: "Description",
  "trans code": "Trans Code",
  quantity: "Quantity",
  price: "Price",
  amount: "Amount",
};

function normalizeHeader(h: string): string {
  const key = h.trim().toLowerCase();
  return ALIASES[key] ?? h.trim();
}

export async function parseRobinhood(
  content: string,
  opts: ParseOptions,
): Promise<ParseResult> {
  const result = Papa.parse<RawRow>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: normalizeHeader,
  });

  const parsed: CanonicalTxn[] = [];
  const errors: ParseResult["errors"] = [];

  for (let i = 0; i < result.data.length; i++) {
    const row = result.data[i]!;
    const lineNo = i + 2; // +2 = header + 1-indexed

    const date = parseUSDate(row["Activity Date"]);
    const amount = parseDollarAmount(row.Amount);
    const description = (row.Description ?? "").trim();
    const transCode = (row["Trans Code"] ?? "").trim();
    const instrument = (row.Instrument ?? "").trim();

    if (!date) {
      errors.push({ row: lineNo, message: "missing/invalid Activity Date", raw: row });
      continue;
    }
    if (amount === null) {
      errors.push({ row: lineNo, message: "missing/invalid Amount", raw: row });
      continue;
    }
    if (!description && !transCode) {
      errors.push({ row: lineNo, message: "row has no description or trans code", raw: row });
      continue;
    }

    const desc = description || transCode;
    const notes = buildNotes({ transCode, qty: row.Quantity, price: row.Price });

    const importHash = await computeImportHash({
      accountId: opts.accountId,
      date,
      amount,
      description: desc,
    });

    parsed.push({
      date,
      amount,
      currency: opts.currency ?? "USD",
      description: desc,
      merchant: instrument || undefined,
      notes,
      pending: false,
      importHash,
      rawData: row,
    });
  }

  return { parsed, errors };
}

function buildNotes(parts: { transCode: string; qty?: string; price?: string }): string | undefined {
  const bits: string[] = [];
  if (parts.transCode) bits.push(`code=${parts.transCode}`);
  if (parts.qty?.trim()) bits.push(`qty=${parts.qty.trim()}`);
  if (parts.price?.trim()) bits.push(`price=${parts.price.trim()}`);
  return bits.length ? bits.join(" ") : undefined;
}
