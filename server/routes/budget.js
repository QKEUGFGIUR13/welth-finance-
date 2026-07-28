import { Router } from "express";
import { getDbUser } from "../middleware/auth.js";
import { toNum } from "../lib/serialize.js";
import { validateBudget, sendValidationError } from "../lib/validation.js";
import { db } from "../lib/prisma.js";

const router = Router();

/** Warn the user once they cross this share of their monthly budget. */
const WARNING_THRESHOLD = 80;

router.get("/", async (req, res) => {
  try {
    const user = await getDbUser(req.auth.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const accountId = req.query.accountId;
    const budget = await db.budget.findFirst({
      where: { userId: user.id },
    });

    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const expenses = await db.transaction.aggregate({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: { gte: startOfMonth, lte: endOfMonth },
        ...(accountId ? { accountId } : {}),
      },
      _sum: { amount: true },
    });

    const budgetAmount = budget ? toNum(budget.amount) : 0;
    const currentExpenses = toNum(expenses._sum.amount) || 0;
    const remaining = budgetAmount - currentExpenses;
    const percentUsed =
      budgetAmount > 0 ? (currentExpenses / budgetAmount) * 100 : 0;

    res.json({
      budget: budget ? { ...budget, amount: budgetAmount } : null,
      currentExpenses,
      remaining,
      percentUsed,
      isWarning: budgetAmount > 0 && percentUsed >= WARNING_THRESHOLD,
      isOverBudget: budgetAmount > 0 && remaining < 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/", async (req, res) => {
  try {
    const user = await getDbUser(req.auth.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { valid, errors, data } = validateBudget(req.body);
    if (!valid) return sendValidationError(res, errors);

    const budget = await db.budget.upsert({
      where: { userId: user.id },
      update: { amount: data.amount },
      create: { userId: user.id, amount: data.amount },
    });

    res.json({
      success: true,
      data: { ...budget, amount: toNum(budget.amount) },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
