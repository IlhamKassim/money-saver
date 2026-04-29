// Parse "$1,234.56" / "($1,234.56)" / "-1234.56" / "" → signed cents.
// Returns null for empty/non-numeric input.
export function parseDollarAmount(input: string | null | undefined): number | null {
  if (input == null) return null;
  const raw = String(input).trim();
  if (raw === "" || raw === "-") return null;

  const negParen = /^\(.*\)$/.test(raw);
  const cleaned = raw.replace(/[(),$\s]/g, "").replace(/^-/, "");

  const num = Number(cleaned);
  if (!Number.isFinite(num)) return null;

  const cents = Math.round(num * 100);
  const sign = negParen || /^-/.test(raw) ? -1 : 1;
  return sign * cents;
}

// Parse "MM/DD/YYYY" → "YYYY-MM-DD". Returns null on invalid input.
export function parseUSDate(input: string | null | undefined): string | null {
  if (input == null) return null;
  const raw = String(input).trim();
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(raw);
  if (!m) {
    // Some exports already use ISO — accept that too.
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    return null;
  }
  const [, mo, da, yr] = m;
  return `${yr}-${mo!.padStart(2, "0")}-${da!.padStart(2, "0")}`;
}

// Stable hash for dedup. Same row content produces same hash regardless of import time.
export async function computeImportHash(parts: {
  accountId: string;
  date: string;
  amount: number;
  description: string;
}): Promise<string> {
  const normDesc = parts.description.trim().toLowerCase().replace(/\s+/g, " ");
  const payload = `${parts.accountId}|${parts.date}|${parts.amount}|${normDesc}`;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
