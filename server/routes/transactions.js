import { Router } from "express";
import multer from "multer";
import { getGeminiModel } from "../lib/gemini.js";
import { getDbUser } from "../middleware/auth.js";
import { serializeMoney, toNum } from "../lib/serialize.js";
import {
  validateTransaction,
  sendValidationError,
} from "../lib/validation.js";
import { db } from "../lib/prisma.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);
  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return date;
}

router.post("/", async (req, res) => {
  try {
    const userId = req.auth.userId;
    const user = await getDbUser(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { valid, errors, data } = validateTransaction(req.body);
    if (!valid) return sendValidationError(res, errors);

    const account = await db.account.findFirst({
      where: { id: data.accountId, userId: user.id },
    });
    if (!account) return res.status(404).json({ error: "Account not found" });

    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = toNum(account.balance) + balanceChange;

    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          type: data.type,
          amount: data.amount,
          description: data.description,
          date: data.date,
          category: data.category,
          accountId: data.accountId,
          isRecurring: data.isRecurring,
          recurringInterval: data.recurringInterval,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return newTransaction;
    });

    res.json({ success: true, data: serializeMoney(transaction) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/scan-receipt", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const model = getGeminiModel();
    const base64String = req.file.buffer.toString("base64");

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: req.file.mimetype,
        },
      },
      prompt,
    ]);

    const text = result.response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const data = JSON.parse(cleanedText);

    res.json({
      amount: parseFloat(data.amount),
      date: new Date(data.date),
      description: data.description,
      category: data.category,
      merchantName: data.merchantName,
    });
  } catch (error) {
    console.error("Error scanning receipt:", error);
    res.status(500).json({ error: "Failed to scan receipt" });
  }
});

router.delete("/", async (req, res) => {
  try {
    const user = await getDbUser(req.auth.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const transactionIds = req.body.ids || [];
    const transactions = await db.transaction.findMany({
      where: { id: { in: transactionIds }, userId: user.id },
    });

    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      const amount = toNum(transaction.amount);
      const change = transaction.type === "EXPENSE" ? amount : -amount;
      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
      return acc;
    }, {});

    await db.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where: { id: { in: transactionIds }, userId: user.id },
      });

      for (const [accountId, balanceChange] of Object.entries(
        accountBalanceChanges
      )) {
        await tx.account.update({
          where: { id: accountId },
          data: { balance: { increment: balanceChange } },
        });
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await getDbUser(req.auth.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const transaction = await db.transaction.findFirst({
      where: { id: req.params.id, userId: user.id },
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json(serializeMoney(transaction));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const user = await getDbUser(req.auth.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { valid, errors, data } = validateTransaction(req.body);
    if (!valid) return sendValidationError(res, errors);

    const originalTransaction = await db.transaction.findFirst({
      where: { id: req.params.id, userId: user.id },
      include: { account: true },
    });

    if (!originalTransaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const targetAccount = await db.account.findFirst({
      where: { id: data.accountId, userId: user.id },
    });
    if (!targetAccount) {
      return res.status(404).json({ error: "Account not found" });
    }

    const oldAmount = toNum(originalTransaction.amount);
    const oldBalanceChange =
      originalTransaction.type === "EXPENSE" ? -oldAmount : oldAmount;

    const newBalanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    const movedAccount = originalTransaction.accountId !== data.accountId;

    const transaction = await db.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: { id: originalTransaction.id },
        data: {
          type: data.type,
          amount: data.amount,
          description: data.description,
          date: data.date,
          category: data.category,
          accountId: data.accountId,
          isRecurring: data.isRecurring,
          recurringInterval: data.recurringInterval,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      if (movedAccount) {
        // Undo the effect on the old account, then apply it to the new one.
        await tx.account.update({
          where: { id: originalTransaction.accountId },
          data: { balance: { increment: -oldBalanceChange } },
        });
        await tx.account.update({
          where: { id: data.accountId },
          data: { balance: { increment: newBalanceChange } },
        });
      } else {
        await tx.account.update({
          where: { id: data.accountId },
          data: { balance: { increment: newBalanceChange - oldBalanceChange } },
        });
      }

      return updated;
    });

    res.json({ success: true, data: serializeMoney(transaction) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
