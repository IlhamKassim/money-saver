import { CheckCircle2, FileUp, Loader2, XCircle } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IngestSummary, Parser } from "@/lib/api";

import { useImportCsv, useParsers } from "./hooks";

export function CsvImportCard({ accountId }: { accountId: string }) {
  const parsers = useParsers();
  const [parserId, setParserId] = useState<Parser["id"]>("robinhood");
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<IngestSummary | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importCsv = useImportCsv();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileUp className="size-4" />
          Import transactions
        </CardTitle>
        <CardDescription>
          Upload a CSV exported from your bank or brokerage.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!file) return;
            setSummary(null);
            importCsv.mutate(
              { file, accountId, parserId },
              {
                onSuccess: (s) => {
                  setSummary(s);
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                },
              },
            );
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="parser">Source</Label>
            <Select value={parserId} onValueChange={(v) => setParserId(v as Parser["id"])}>
              <SelectTrigger id="parser" className="w-full">
                <SelectValue placeholder="Choose a parser" />
              </SelectTrigger>
              <SelectContent>
                {(parsers.data?.parsers ?? []).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="csv-file">CSV file</Label>
            <Input
              ref={fileInputRef}
              id="csv-file"
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <Button type="submit" disabled={!file || importCsv.isPending} className="w-fit">
            {importCsv.isPending && <Loader2 className="size-4 animate-spin" />}
            Import
          </Button>
        </form>
      </CardContent>

      {(summary || importCsv.isError) && (
        <CardFooter className="border-t flex-col items-start gap-2">
          {summary && <ImportSummary summary={summary} />}
          {importCsv.isError && (
            <div className="text-destructive flex items-center gap-2 text-sm">
              <XCircle className="size-4" />
              {(importCsv.error as Error).message}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

function ImportSummary({ summary }: { summary: IngestSummary }) {
  return (
    <div className="grid w-full gap-1 text-sm">
      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="size-4" />
        <span>
          Imported <strong>{summary.inserted}</strong> · skipped{" "}
          <strong>{summary.skipped}</strong> (duplicates) · parsed{" "}
          <strong>{summary.parsed}</strong>
        </span>
      </div>
      {summary.errors.length > 0 && (
        <details className="text-muted-foreground">
          <summary className="cursor-pointer">
            {summary.errors.length} row{summary.errors.length === 1 ? "" : "s"} skipped with errors
          </summary>
          <ul className="ml-4 mt-1 list-disc space-y-1">
            {summary.errors.slice(0, 5).map((err, i) => (
              <li key={i}>
                Row {err.row}: {err.message}
              </li>
            ))}
            {summary.errors.length > 5 && <li>… and {summary.errors.length - 5} more</li>}
          </ul>
        </details>
      )}
    </div>
  );
}
