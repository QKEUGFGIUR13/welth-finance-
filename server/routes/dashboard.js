import { Router } from "express";
import { getDbUser } from "../middleware/auth.js";
import { serializeMoney } from "../lib/serialize.js";
import { db } from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const user = await getDbUser(req.auth.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    res.json(transactions.map(serializeMoney));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
