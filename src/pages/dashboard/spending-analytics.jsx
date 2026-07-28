import { format } from "date-fns";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Minus,
  PiggyBank,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency } from "@/lib/utils";
import { defaultCategories } from "@/data/categories";

const CATEGORY_LABELS = defaultCategories.reduce((acc, category) => {
  acc[category.id] = category.name;
  return acc;
}, {});

function label(categoryId) {
  return CATEGORY_LABELS[categoryId] || categoryId;
}

function StatCard({ icon: Icon, title, value, sub, tone = "default" }) {
  const tones = {
    default: "bg-muted text-foreground",
    positive: "bg-emerald-500/10 text-emerald-600",
    negative: "bg-rose-500/10 text-rose-600",
    neutral: "bg-sky-500/10 text-sky-600",
  };

  return (
    <Card>
      <CardContent className="flex items-start gap-3 py-5">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            tones[tone]
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="truncate text-lg font-semibold">{value}</p>
          {sub && (
            <p className="truncate text-xs text-muted-foreground">{sub}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-start gap-3 py-5">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function SpendingAnalytics({ analytics, loading }) {
  if (loading) return <AnalyticsSkeleton />;
  if (!analytics) return null;

  const {
    period,
    totalIncome,
    totalExpenses,
    savings,
    savingsRate,
    averageDailySpending,
    highestCategory,
    lowestCategory,
    topExpenses,
    previousMonth,
  } = analytics;

  const change = previousMonth.percentChange;
  const spendingUp = previousMonth.difference > 0;
  const noChange = Math.abs(previousMonth.difference) < 0.01;

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Spending Analytics</h2>
        <span className="text-sm text-muted-foreground">{period.label}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={TrendingUp}
          title="Monthly Income"
          value={formatCurrency(totalIncome)}
          tone="positive"
        />
        <StatCard
          icon={TrendingDown}
          title="Monthly Expenses"
          value={formatCurrency(totalExpenses)}
          tone="negative"
        />
        <StatCard
          icon={PiggyBank}
          title="Savings This Month"
          value={formatCurrency(savings)}
          sub={
            totalIncome > 0
              ? `${savingsRate.toFixed(1)}% of income saved`
              : "No income recorded"
          }
          tone={savings >= 0 ? "positive" : "negative"}
        />
        <StatCard
          icon={CalendarDays}
          title="Average Daily Spending"
          value={formatCurrency(averageDailySpending)}
          sub="Based on days elapsed this month"
          tone="neutral"
        />
        <StatCard
          icon={ArrowUpRight}
          title="Highest Spending Category"
          value={highestCategory ? label(highestCategory.category) : "—"}
          sub={
            highestCategory ? formatCurrency(highestCategory.amount) : "No expenses yet"
          }
          tone="negative"
        />
        <StatCard
          icon={ArrowDownRight}
          title="Lowest Spending Category"
          value={lowestCategory ? label(lowestCategory.category) : "—"}
          sub={
            lowestCategory
              ? formatCurrency(lowestCategory.amount)
              : "Need at least two categories"
          }
          tone="neutral"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Compared to Last Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  noChange
                    ? "bg-muted text-muted-foreground"
                    : spendingUp
                      ? "bg-rose-500/10 text-rose-600"
                      : "bg-emerald-500/10 text-emerald-600"
                )}
              >
                {noChange ? (
                  <Minus className="h-5 w-5" />
                ) : spendingUp ? (
                  <ArrowUpRight className="h-5 w-5" />
                ) : (
                  <ArrowDownRight className="h-5 w-5" />
                )}
              </span>
              <div>
                <p
                  className={cn(
                    "text-xl font-semibold",
                    noChange
                      ? "text-foreground"
                      : spendingUp
                        ? "text-rose-600"
                        : "text-emerald-600"
                  )}
                >
                  {noChange
                    ? "No change"
                    : `${spendingUp ? "+" : ""}${change.toFixed(1)}%`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {previousMonth.totalExpenses > 0
                    ? `You spent ${formatCurrency(
                        Math.abs(previousMonth.difference)
                      )} ${spendingUp ? "more" : "less"} than last month (${formatCurrency(
                        previousMonth.totalExpenses
                      )})`
                    : "No expenses recorded last month to compare against"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top 5 Largest Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {topExpenses.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">
                No expenses recorded this month.
              </p>
            ) : (
              <ul className="divide-y">
                {topExpenses.map((expense) => (
                  <li
                    key={expense.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {expense.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {label(expense.category)} ·{" "}
                        {format(new Date(expense.date), "dd MMM")}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-rose-600">
                      {formatCurrency(expense.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
