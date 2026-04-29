// Vite proxies /api → http://localhost:3000 (see vite.config.ts).
const BASE = "/api";

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `API ${status}`);
    this.status = status;
    this.body = body;
  }
}

type FetchOpts = Omit<RequestInit, "body"> & { body?: unknown };

async function request<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const isForm = opts.body instanceof FormData;
  const headers = new Headers(opts.headers);
  if (!isForm && opts.body !== undefined) headers.set("Content-Type", "application/json");
  if (!headers.has("x-user-id")) headers.set("x-user-id", "default-user");

  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers,
    body:
      opts.body === undefined
        ? undefined
        : isForm
          ? (opts.body as FormData)
          : JSON.stringify(opts.body),
  });

  if (!res.ok) {
    let body: unknown = undefined;
    try {
      body = await res.json();
    } catch {
      // ignore
    }
    throw new ApiError(res.status, body, `${res.status} ${res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  postForm: <T>(path: string, form: FormData) => request<T>(path, { method: "POST", body: form }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

// ---- Domain types (mirror server response shapes) -------------------------

export type Account = {
  id: string;
  userId: string;
  name: string;
  type: "checking" | "savings" | "credit" | "investment" | "loan" | "cash" | "other";
  institution: string | null;
  currency: string;
  currentBalance: number | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Transaction = {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string | null;
  date: string;
  amount: number;
  currency: string;
  description: string;
  merchant: string | null;
  notes: string | null;
  pending: boolean;
  importHash: string | null;
  importBatchId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Parser = { id: "robinhood"; label: string };

export type IngestSummary = {
  parsed: number;
  inserted: number;
  skipped: number;
  errors: { row: number; message: string; raw: unknown }[];
  importBatchId: string;
};
