# money-saver

Local-first personal finance dashboard. Bun + Hono + SQLite (Drizzle) + React.

## Layout

```
apps/
  client/        React + Vite (scaffold pending)
  server/        Hono API on Bun
packages/
  db/            Drizzle schema + bun:sqlite client
  shared/        Zod validators + types reused client/server
data/            Local SQLite file (gitignored)
```

## Setup

```bash
# 1. Install Bun (one-time)
curl -fsSL https://bun.sh/install | bash

# 2. Install workspace deps
bun install

# 3. Scaffold the React client into apps/client (one-time)
rm -rf apps/client && bun create vite apps/client --template react-ts
cd apps/client && bun add @tanstack/react-query @money-saver/shared@workspace:*

# 4. Generate the initial migration from the Drizzle schema
bun run db:generate

# 5. Apply migrations (creates data/finance.db)
bun run db:migrate

# 6. Run server + client
bun run dev:server     # http://localhost:3000
bun run dev:client     # http://localhost:5173
```

## Data model (V1)

- `users` — profile rows; every other table FKs to `users.id`
- `accounts` — checking / savings / credit / investment / loan / cash / other
- `categories` — hierarchical, per-user, kind ∈ income | expense | transfer
- `transactions` — signed minor units (cents), import_hash for dedup, raw CSV preserved as JSON
- `subscriptions` — recurring charge tracking
- `budgets` — per-category cap by period

## Money representation

All amounts stored as **signed integer minor units** (e.g. cents for USD). Never floats.
