import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");

export const createTransactionSchema = z.object({
  accountId: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  date: isoDate,
  // Signed minor units. Negative = outflow, positive = inflow.
  amount: z.number().int(),
  currency: z.string().length(3).default("USD"),
  description: z.string().min(1),
  merchant: z.string().optional(),
  notes: z.string().optional(),
  pending: z.boolean().default(false),
});

export const listTransactionsQuerySchema = z.object({
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  from: isoDate.optional(),
  to: isoDate.optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100),
  cursor: z.string().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
