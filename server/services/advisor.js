import { getGeminiModel, hasGeminiKey } from "../lib/gemini.js";

/**
 * AI financial advisor.
 *
 * We send one compact monthly summary instead of raw transactions. That keeps
 * the prompt small (cheap + fast), avoids leaking every individual record to a
 * third party, and gives the model exactly the aggregates it needs.
 */

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function buildPrompt(analytics, budgetAmount) {
  const categories = analytics.byCategory
    .slice(0, 8)
    .map((c) => `- ${c.category}: ${money(c.amount)}`)
    .join("\n");

  const trend =
    analytics.previousMonth.totalExpenses > 0
      ? `${analytics.previousMonth.percentChange >= 0 ? "up" : "down"} ${Math.abs(
          analytics.previousMonth.percentChange
        ).toFixed(1)}% vs last month (${money(
          analytics.previousMonth.totalExpenses
        )})`
      : "no data for last month";

  return `You are a practical personal finance advisor for a young professional.

Monthly spending summary for ${analytics.period.label}:
- Total income: ${money(analytics.totalIncome)}
- Total expenses: ${money(analytics.totalExpenses)}
- Savings: ${money(analytics.savings)}
- Monthly budget: ${budgetAmount ? money(budgetAmount) : "not set"}
- Average daily spending: ${money(analytics.averageDailySpending)}
- Number of transactions: ${analytics.transactionCount}
- Expense trend: ${trend}

Spending by category:
${categories || "- no expenses recorded"}

Respond ONLY with valid JSON in exactly this shape:
{
  "analysis": "2-3 sentence plain-English summary of their financial health",
  "savingTips": ["tip 1", "tip 2", "tip 3"],
  "unnecessarySpending": "1-2 sentences naming the categories that look avoidable",
  "recommendedBudget": {
    "amount": number,
    "reason": "1 sentence explaining the number"
  }
}

Use concrete numbers from the summary. Keep every field short and actionable.`;
}

/** Fallback so the dashboard still shows something useful without an API key. */
function ruleBasedAdvice(analytics, budgetAmount) {
  const top = analytics.highestCategory;
  const suggested = analytics.totalExpenses > 0
    ? Math.round(analytics.totalExpenses * 0.9)
    : budgetAmount || 0;

  return {
    analysis:
      analytics.totalExpenses === 0
        ? "No expenses recorded this month yet, so there is nothing to analyse. Add a few transactions to get insights."
        : `You spent ${money(analytics.totalExpenses)} against ${money(
            analytics.totalIncome
          )} of income, saving ${money(analytics.savings)}. Your average daily spend is ${money(
            analytics.averageDailySpending
          )}.`,
    savingTips: [
      top
        ? `${top.category} is your largest category at ${money(top.amount)} — try cutting it by 10%.`
        : "Record your expenses consistently so patterns become visible.",
      "Set a monthly budget and review it weekly instead of at month end.",
      "Move your savings out of the spending account on payday.",
    ],
    unnecessarySpending: top
      ? `Most of your spending is concentrated in ${top.category}. Review it for repeat purchases you can drop.`
      : "Not enough data to spot avoidable spending yet.",
    recommendedBudget: {
      amount: suggested,
      reason: "About 10% below your current spending, which is a realistic first target.",
    },
    source: "rules",
  };
}

export async function generateFinancialAdvice(analytics, budgetAmount) {
  if (!hasGeminiKey()) {
    return ruleBasedAdvice(analytics, budgetAmount);
  }

  try {
    const model = getGeminiModel();
    const result = await model.generateContent(
      buildPrompt(analytics, budgetAmount)
    );

    // Gemini often wraps JSON in a ```json fence, so strip it before parsing.
    const text = result.response.text().replace(/```(?:json)?/g, "").trim();
    const parsed = JSON.parse(text);

    return {
      analysis: parsed.analysis || "",
      savingTips: Array.isArray(parsed.savingTips)
        ? parsed.savingTips.slice(0, 3)
        : [],
      unnecessarySpending: parsed.unnecessarySpending || "",
      recommendedBudget: {
        amount: Number(parsed.recommendedBudget?.amount) || 0,
        reason: parsed.recommendedBudget?.reason || "",
      },
      source: "ai",
    };
  } catch (error) {
    console.error("AI advisor failed, using rule-based fallback:", error.message);
    return ruleBasedAdvice(analytics, budgetAmount);
  }
}
