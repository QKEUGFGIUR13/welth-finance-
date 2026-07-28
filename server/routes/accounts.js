import { Router } from "express";
import { ensureUser } from "../middleware/auth.js";
import { serializeMoney } from "../lib/serialize.js";
import { validateAccount, sendValidationError } from "../lib/validation.js";
import { db } from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const user = await ensureUser(req.auth.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const accounts = await db.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { transactions: true } },
      },
    });

    res.json(accounts.map(serializeMoney));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = req.auth.userId;
    const user = await ensureUser(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { valid, errors, data } = validateAccount(req.body);
    if (!valid) return sendValidationError(res, errors);

    const existingAccounts = await db.account.findMany({
      where: { userId: user.id },
    });

    const shouldBeDefault =
      existingAccounts.length === 0 ? true : Boolean(data.isDefault);

    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const account = await db.account.create({
      data: {
        name: data.name,
        type: data.type,
        balance: data.balance,
        userId: user.id,
        isDefault: shouldBeDefault,
      },
    });

    res.json({ success: true, data: serializeMoney(account) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await ensureUser(req.auth.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const account = await db.account.findFirst({
      where: { id: req.params.id, userId: user.id },
      include: {
        transactions: { orderBy: { date: "desc" } },
        _count: { select: { transactions: true } },
      },
    });

    if (!account) return res.status(404).json({ error: "Account not found" });

    res.json({
      ...serializeMoney(account),
      transactions: account.transactions.map(serializeMoney),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.patch("/:id/default", async (req, res) => {
  try {
    const user = await ensureUser(req.auth.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const existing = await db.account.findFirst({
      where: { id: req.params.id, userId: user.id },
    });
    if (!existing) return res.status(404).json({ error: "Account not found" });

    await db.account.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });

    const account = await db.account.update({
      where: { id: existing.id },
      data: { isDefault: true },
    });

    res.json({ success: true, data: serializeMoney(account) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
