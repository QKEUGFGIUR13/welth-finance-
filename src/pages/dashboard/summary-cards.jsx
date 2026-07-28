import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function SummaryCards({ accounts = [], transactions = [], budget }) {
  const totalBalance = accounts.reduce(
    (sum, acc) => sum + (Number(acc.balance) || 0),
    0
  );

  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const hasBudget = Boolean(budget?.budget);
  const remaining = budget?.remaining ?? 0;

  const cards = [
    {
      label: "Total Balance",
      value: formatCurrency(totalBalance, { decimals: 0 }),
      icon: Wallet,
      tint: "bg-pine/10 text-pine",
    },
    {
      label: "Total Income",
      value: formatCurrency(totalIncome, { decimals: 0 }),
      icon: TrendingUp,
      tint: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "Total Expenses",
      value: formatCurrency(totalExpenses, { decimals: 0 }),
      icon: TrendingDown,
      tint: "bg-rose-500/10 text-rose-600",
    },
    {
      label: "Remaining Budget",
      value: hasBudget
        ? formatCurrency(remaining, { decimals: 0 })
        : "Not set",
      icon: PiggyBank,
      tint:
        hasBudget && remaining < 0
          ? "bg-rose-500/10 text-rose-600"
          : "bg-amber-500/10 text-amber-600",
      valueClass: hasBudget && remaining < 0 ? "text-rose-600" : "text-ink",
      hint: hasBudget ? "This month" : "Set one below",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, tint, valueClass, hint }) => (
        <Card key={label} className="border-border/70">
          <CardContent className="flex items-center gap-4 py-5">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tint}`}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p
                className={`font-display text-2xl ${valueClass || "text-ink"}`}
                style={{ fontWeight: 700 }}
              >
                {value}
              </p>
              {hint && (
                <p className="text-xs text-muted-foreground">{hint}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
