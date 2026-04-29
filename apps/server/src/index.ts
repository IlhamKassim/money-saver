import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { accountsRoutes } from "./routes/accounts";
import { budgetsRoutes } from "./routes/budgets";
import { categoriesRoutes } from "./routes/categories";
import { ingestionRoutes } from "./routes/ingestion";
import { subscriptionsRoutes } from "./routes/subscriptions";
import { transactionsRoutes } from "./routes/transactions";
import { currentUser } from "./middleware/current-user";

const app = new Hono();

app.use("*", logger());
app.use("*", cors({ origin: ["http://localhost:5173"], credentials: true }));

app.get("/health", (c) => c.json({ ok: true }));

const api = new Hono();
api.use("*", currentUser);
api.route("/accounts", accountsRoutes);
api.route("/categories", categoriesRoutes);
api.route("/transactions", transactionsRoutes);
api.route("/subscriptions", subscriptionsRoutes);
api.route("/budgets", budgetsRoutes);
api.route("/ingestion", ingestionRoutes);

app.route("/api", api);

const port = Number(process.env.PORT ?? 3000);
console.log(`→ money-saver server on http://localhost:${port}`);

export default { port, fetch: app.fetch };
export type AppType = typeof app;
