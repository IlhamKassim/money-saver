import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateAccount, type CreateAccountInput } from "./hooks";

const TYPES: { value: CreateAccountInput["type"]; label: string }[] = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
  { value: "credit", label: "Credit Card" },
  { value: "investment", label: "Investment" },
  { value: "loan", label: "Loan" },
  { value: "cash", label: "Cash" },
  { value: "other", label: "Other" },
];

export function CreateAccountInline() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<CreateAccountInput["type"]>("investment");
  const [institution, setInstitution] = useState("");
  const create = useCreateAccount();

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        New account
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>New account</CardTitle>
        <CardDescription>Group transactions by where they live.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            create.mutate(
              { name: name.trim(), type, institution: institution.trim() || undefined },
              {
                onSuccess: () => {
                  setOpen(false);
                  setName("");
                  setInstitution("");
                },
              },
            );
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="acct-name">Name</Label>
            <Input
              id="acct-name"
              placeholder="Robinhood Brokerage"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="acct-type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as CreateAccountInput["type"])}>
              <SelectTrigger id="acct-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="acct-inst">Institution (optional)</Label>
            <Input
              id="acct-inst"
              placeholder="Robinhood"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
            />
          </div>
          {create.isError && (
            <p className="text-destructive text-sm">
              {(create.error as Error).message}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={create.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending || !name.trim()}>
              {create.isPending && <Loader2 className="size-4 animate-spin" />}
              Create
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
