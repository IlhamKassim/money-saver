import { z } from "zod";

export const accountTypeSchema = z.enum([
  "checking",
  "savings",
  "credit",
  "investment",
  "loan",
  "cash",
  "other",
]);

export const createAccountSchema = z.object({
  name: z.string().min(1).max(120),
  type: accountTypeSchema,
  institution: z.string().max(120).optional(),
  currency: z.string().length(3).default("USD"),
  currentBalance: z.number().int().optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
