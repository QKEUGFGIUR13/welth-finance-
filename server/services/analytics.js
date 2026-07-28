import { toNum } from "../lib/serialize.js";
import { db } from "../lib/prisma.js";

/**
 * Monthly spending analytics.
 *
 * Everything is derived from the transaction list rather than stored, so there
 * is no extra table to keep in sync — the numbers are always correct.
 */

function monthBounds(year, monthIndex) {
  return {
    start: new Date(year, monthIndex, 1),
    end: new Date(year, monthIndex + 1, 0, 23, 59, 59, 999),
  };
}

function sumBy(transactions, type) {
  return transactions
    .filter((t) => t.type === type)
    .reduce((total, t) => total + toNum(t.amount), 0);
}

/** { food: 1200, travel: 800 } sorted highest first. */
function groupByCategory(transactions) {
  const totals = {};
  for (const t of transactions) {
    totals[t.category] = (totals[t.category] || 0) + toNum(t.amount);
  }
  return Object.entries(totals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

/** Percentage change from previous to current; 0 when there is no baseline. */
function percentChange(current, previous) {
  if (!previous) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export async function getMonthlyAnalytics(userId, { year, month, accountId }) {
  const now = new Date();
  const targetYear = Number.isInteger(year) ? year : now.getFullYear();
  const targetMonth = Number.isInteger(month) ? month : now.getMonth();

  const current = monthBounds(targetYear, targetMonth);
  const previous = monthBounds(targetYear, targetMonth - 1);

  const accountFilter = accountId ? { accountId } : {};

  const [currentTransactions, previousTransactions] = await Promise.all([
    db.transaction.findMany({
      where: {
        userId,
        ...accountFilter,
        date: { gte: current.start, lte: current.end },
      },
      orderBy: { date: "desc" },
    }),
    db.transaction.findMany({
      where: {
        userId,
        ...accountFilter,
        date: { gte: previous.start, lte: previous.end },
      },
    }),
  ]);

  const totalIncome = sumBy(currentTransactions, "INCOME");
  const totalExpenses = sumBy(currentTransactions, "EXPENSE");
  const previousExpenses = sumBy(previousTransactions, "EXPENSE");

  const expenses = currentTransactions.filter((t) => t.type === "EXPENSE");
  const byCategory = groupByCategory(expenses);

  // Average over days elapsed so far this month, not the full month length,
  // otherwise the average looks artificially low early in the month.
  const isCurrentMonth =
    targetYear === now.getFullYear() && targetMonth === now.getMonth();
  const daysElapsed = isCurrentMonth
    ? now.getDate()
    : current.end.getDate();

  const topExpenses = [...expenses]
    .sort((a, b) => toNum(b.amount) - toNum(a.amount))
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      description: t.description || "Untitled Transaction",
      category: t.category,
      amount: toNum(t.amount),
      date: t.date,
    }));

  return {
    period: {
      year: targetYear,
      month: targetMonth,
      label: current.start.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      }),
    },
    totalIncome,
    totalExpenses,
    savings: totalIncome - totalExpenses,
    savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
    averageDailySpending: daysElapsed > 0 ? totalExpenses / daysElapsed : 0,
    transactionCount: currentTransactions.length,
    highestCategory: byCategory[0] || null,
    lowestCategory: byCategory.length > 1 ? byCategory[byCategory.length - 1] : null,
    byCategory,
    topExpenses,
    previousMonth: {
      totalExpenses: previousExpenses,
      difference: totalExpenses - previousExpenses,
      percentChange: percentChange(totalExpenses, previousExpenses),
    },
  };
}
