import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type Account } from "@/lib/api";

export const accountKeys = {
  all: ["accounts"] as const,
};

export function useAccounts() {
  return useQuery({
    queryKey: accountKeys.all,
    queryFn: () => api.get<Account[]>("/accounts"),
  });
}

export type CreateAccountInput = {
  name: string;
  type: Account["type"];
  institution?: string;
  currency?: string;
};

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAccountInput) => api.post<Account>("/accounts", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
}
