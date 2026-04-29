import { useQuery } from "@tanstack/react-query";

import { api, type Transaction } from "@/lib/api";

export const transactionKeys = {
  all: ["transactions"] as const,
  byAccount: (accountId: string) => ["transactions", { accountId }] as const,
};

export function useTransactions(params: { accountId?: string }) {
  return useQuery({
    queryKey: params.accountId
      ? transactionKeys.byAccount(params.accountId)
      : transactionKeys.all,
    queryFn: () => {
      const qs = params.accountId ? `?accountId=${encodeURIComponent(params.accountId)}` : "";
      return api.get<Transaction[]>(`/transactions${qs}`);
    },
    enabled: true,
  });
}
