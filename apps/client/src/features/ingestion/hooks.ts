import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type IngestSummary, type Parser } from "@/lib/api";
import { transactionKeys } from "@/features/transactions/hooks";

export function useParsers() {
  return useQuery({
    queryKey: ["parsers"],
    queryFn: () => api.get<{ parsers: Parser[] }>("/ingestion/parsers"),
    staleTime: Infinity,
  });
}

export type ImportInput = {
  accountId: string;
  parserId: Parser["id"];
  file: File;
};

export function useImportCsv() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ImportInput): Promise<IngestSummary> => {
      const fd = new FormData();
      fd.append("file", input.file);
      fd.append("parserId", input.parserId);
      fd.append("accountId", input.accountId);
      return api.postForm<IngestSummary>("/ingestion/csv", fd);
    },
    onSuccess: (_summary, vars) => {
      qc.invalidateQueries({ queryKey: transactionKeys.byAccount(vars.accountId) });
      qc.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}
