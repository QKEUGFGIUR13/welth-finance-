import { Router } from "express";
import { getDbUser } from "../middleware/auth.js";
import { toNum } from "../lib/serialize.js";
import { getMonthlyAnalytics } from "../services/analytics.js";
import { generateFinancialAdvice } from "../services/advisor.js";
import { db } from "../lib/prisma.js";

const router = Router();

/**
 * POST because generating advice calls an external LLM — it is not a cheap,
 * cacheable read, and we do not want browsers or proxies replaying it.
 */
router.post("/", async (req, res) => {
  try {
    const user = await getDbUser(req.auth.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const [analytics, budget] = await Promise.all([
      getMonthlyAnalytics(user.id, {}),
      db.budget.findFirst({ where: { userId: user.id } }),
    ]);

    const advice = await generateFinancialAdvice(
      analytics,
      budget ? toNum(budget.amount) : null
    );

    res.json({ success: true, period: analytics.period, ...advice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
