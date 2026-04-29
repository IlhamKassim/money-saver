import { Wallet } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateAccountInline } from "@/features/accounts/CreateAccountDialog";
import { useAccounts } from "@/features/accounts/hooks";
import { CsvImportCard } from "@/features/ingestion/CsvImportCard";
import { TransactionsTable } from "@/features/transactions/TransactionsTable";

function App() {
  const accounts = useAccounts();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Auto-select the first account once data lands.
  useEffect(() => {
    if (!selectedId && accounts.data && accounts.data.length > 0) {
      setSelectedId(accounts.data[0]!.id);
    }
    if (selectedId && accounts.data && !accounts.data.some((a) => a.id === selectedId)) {
      setSelectedId(accounts.data[0]?.id ?? null);
    }
  }, [accounts.data, selectedId]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Wallet className="size-5" />
            <h1 className="text-base font-semibold">money-saver</h1>
            <Badge variant="secondary" className="ml-2">
              local
            </Badge>
          </div>
          <div className="text-muted-foreground text-xs">
            Profile: <code className="font-mono">default-user</code>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div className="grid gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground text-sm">
              Choose an account to view its transactions, or import a CSV.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {accounts.data && accounts.data.length > 0 ? (
              <Select value={selectedId ?? ""} onValueChange={setSelectedId}>
                <SelectTrigger className="min-w-[220px]">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.data.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                      <span className="text-muted-foreground ml-1">· {a.type}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
            <CreateAccountInline />
          </div>
        </section>

        {accounts.isLoading ? (
          <div className="text-muted-foreground text-sm">Loading accounts…</div>
        ) : accounts.data && accounts.data.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center">
            <h3 className="mb-1 text-lg font-medium">No accounts yet</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Create an account to start importing transactions.
            </p>
            <CreateAccountInline />
          </div>
        ) : selectedId ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <TransactionsTable accountId={selectedId} />
            <CsvImportCard accountId={selectedId} />
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default App;
