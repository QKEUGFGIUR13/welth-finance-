import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { requireUserId } from "./middleware/auth.js";
import accountsRouter from "./routes/accounts.js";
import transactionsRouter from "./routes/transactions.js";
import budgetRouter from "./routes/budget.js";
import dashboardRouter from "./routes/dashboard.js";
import analyticsRouter from "./routes/analytics.js";
import insightsRouter from "./routes/insights.js";
import usersRouter from "./routes/users.js";
import { seedTransactions } from "./services/seed.js";
import { inngest } from "./inngest/client.js";
import {
  checkBudgetAlerts,
  generateMonthlyReports,
  processRecurringTransaction,
  triggerRecurringTransactions,
} from "./inngest/functions.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === "production";

app.use(
  cors({
    origin: isProd ? false : ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);
app.use(express.json({ limit: "6mb" }));
app.use(clerkMiddleware());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/seed", async (req, res) => {
  const result = await seedTransactions({
    accountId: req.query.accountId,
    userId: req.query.userId,
  });
  res.json(result);
});

app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [
      processRecurringTransaction,
      triggerRecurringTransactions,
      generateMonthlyReports,
      checkBudgetAlerts,
    ],
  })
);

app.use("/api/users", requireUserId, usersRouter);
app.use("/api/accounts", requireUserId, accountsRouter);
app.use("/api/transactions", requireUserId, transactionsRouter);
app.use("/api/budget", requireUserId, budgetRouter);
app.use("/api/dashboard", requireUserId, dashboardRouter);
app.use("/api/analytics", requireUserId, analyticsRouter);
app.use("/api/insights", requireUserId, insightsRouter);

if (isProd) {
  const distPath = path.join(__dirname, "..", "dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
