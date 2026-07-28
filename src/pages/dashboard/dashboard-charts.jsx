import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, subMonths } from "date-fns";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { categoryColors, defaultCategories } from "@/data/categories";

const CATEGORY_LABELS = defaultCategories.reduce((acc, category) => {
  acc[category.id] = category.name;
  return acc;
}, {});

const MONTH_RANGES = {
  3: "Last 3 months",
  6: "Last 6 months",
  12: "Last 12 months",
};

const FALLBACK_COLORS = [
  "#1A7A66",
  "#f97316",
  "#6366f1",
  "#e11d48",
  "#0ea5e9",
  "#84cc16",
  "#a855f7",
];

/** Groups transactions into { month, income, expense } buckets, oldest first. */
function buildMonthlySeries(transactions, months) {
  const buckets = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(now, i);
    buckets.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      month: format(date, "MMM yy"),
      income: 0,
      expense: 0,
    });
  }

  const index = new Map(buckets.map((b) => [b.key, b]));

  for (const t of transactions) {
    const date = new Date(t.date);
    const bucket = index.get(`${date.getFullYear()}-${date.getMonth()}`);
    if (!bucket) continue;

    if (t.type === "INCOME") bucket.income += Number(t.amount) || 0;
    else bucket.expense += Number(t.amount) || 0;
  }

  return buckets;
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border bg-background p-2 shadow-sm">
      <p className="mb-1 text-xs font-medium">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function DashboardCharts({ transactions = [] }) {
  const [months, setMonths] = useState(6);

  const monthlyData = useMemo(
    () => buildMonthlySeries(transactions, months),
    [transactions, months]
  );

  const categoryData = useMemo(() => {
    const now = new Date();
    const totals = {};

    for (const t of transactions) {
      if (t.type !== "EXPENSE") continue;
      const date = new Date(t.date);
      if (
        date.getMonth() !== now.getMonth() ||
        date.getFullYear() !== now.getFullYear()
      ) {
        continue;
      }
      totals[t.category] = (totals[t.category] || 0) + (Number(t.amount) || 0);
    }

    return Object.entries(totals)
      .map(([category, value]) => ({
        name: CATEGORY_LABELS[category] || category,
        value,
        color: categoryColors[category],
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const totals = monthlyData.reduce(
    (acc, m) => ({
      income: acc.income + m.income,
      expense: acc.expense + m.expense,
    }),
    { income: 0, expense: 0 }
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-base">Income vs Expense</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Income {formatCurrency(totals.income, { decimals: 0 })} · Expense{" "}
              {formatCurrency(totals.expense, { decimals: 0 })}
            </p>
          </div>
          <Select
            value={String(months)}
            onValueChange={(v) => setMonths(Number(v))}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MONTH_RANGES).map(([value, text]) => (
                <SelectItem key={value} value={value}>
                  {text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" fontSize={12} tickLine={false} />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">
            Expenses by Category (This Month)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length === 0 ? (
            <div className="flex h-[280px] items-center justify-center">
              <p className="text-sm text-muted-foreground">
                No expenses recorded this month
              </p>
            </div>
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                    fontSize={11}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={
                          entry.color ||
                          FALLBACK_COLORS[index % FALLBACK_COLORS.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
