import { Router } from "express";
import { ensureUser } from "../middleware/auth.js";
import { getMonthlyAnalytics } from "../services/analytics.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const user = await ensureUser(req.auth.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const analytics = await getMonthlyAnalytics(user.id, {
      year: req.query.year ? Number(req.query.year) : undefined,
      month: req.query.month ? Number(req.query.month) : undefined,
      accountId: req.query.accountId || undefined,
    });

    res.json(analytics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
