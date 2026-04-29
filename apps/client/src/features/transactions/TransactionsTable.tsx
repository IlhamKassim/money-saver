import { ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatCents, formatDate } from "@/lib/utils";

import { useTransactions } from "./hooks";

export function TransactionsTable({ accountId }: { accountId: string }) {
  const txns = useTransactions({ accountId });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
        <CardDescription>
          Most recent activity for the selected account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {txns.isLoading && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" /> Loading…
          </div>
        )}
        {txns.isError && (
          <div className="text-destructive text-sm">
            Failed to load: {(txns.error as Error).message}
          </div>
        )}
        {txns.data && txns.data.length === 0 && (
          <div className="text-muted-foreground text-sm">
            No transactions yet. Import a CSV to get started.
          </div>
        )}
        {txns.data && txns.data.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[110px]">Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {txns.data.map((t) => {
                const isInflow = t.amount > 0;
                return (
                  <TableRow key={t.id}>
                    <TableCell className="text-muted-foreground">
                      {formatDate(t.date)}
                    </TableCell>
                    <TableCell className="font-medium">{t.description}</TableCell>
                    <TableCell>
                      {t.merchant ? <Badge variant="outline">{t.merchant}</Badge> : null}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {t.notes}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-mono tabular-nums",
                        isInflow
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-foreground",
                      )}
                    >
                      <span className="inline-flex items-center justify-end gap-1">
                        {isInflow ? (
                          <ArrowDownLeft className="size-3" />
                        ) : (
                          <ArrowUpRight className="size-3 opacity-40" />
                        )}
                        {formatCents(t.amount, t.currency)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
