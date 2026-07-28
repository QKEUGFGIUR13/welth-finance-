import { useEffect, useState } from "react";
import { Plus, AlertCircle, RefreshCw } from "lucide-react";
import {
  getUserAccounts,
  getDashboardData,
  getCurrentBudget,
  getAnalytics,
} from "@/lib/api";
import { AccountCard } from "@/pages/dashboard/account-card";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { BudgetProgress } from "@/pages/dashboard/budget-progress";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardOverview } from "@/pages/dashboard/transaction-overview";
import { SummaryCards } from "@/pages/dashboard/summary-cards";
import { SpendingAnalytics } from "@/pages/dashboard/spending-analytics";
import { DashboardCharts } from "@/pages/dashboard/dashboard-charts";
import { AiInsights } from "@/pages/dashboard/ai-insights";
import { AllTransactions } from "@/pages/dashboard/all-transactions";

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 py-5">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-28" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-2 w-full" />
        </CardHeader>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[260px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgetData, setBudgetData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [accountsData, transactionsData, analyticsData] = await Promise.all([
        getUserAccounts(),
        getDashboardData(),
        getAnalytics(),
      ]);
      setAccounts(accountsData || []);
      setTransactions(transactionsData || []);
      setAnalytics(analyticsData || null);

      const defaultAccount = accountsData?.find((account) => account.isDefault);
      if (defaultAccount) {
        setBudgetData(await getCurrentBudget(defaultAccount.id));
      } else {
        setBudgetData(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-rose-200">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <AlertCircle className="h-8 w-8 text-rose-500" />
          <div>
            <p className="font-medium">Could not load your dashboard</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={load} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <SummaryCards
        accounts={accounts}
        transactions={transactions}
        budget={budgetData}
      />

      <BudgetProgress
        initialBudget={budgetData?.budget}
        currentExpenses={budgetData?.currentExpenses || 0}
        remaining={budgetData?.remaining}
        percentUsed={budgetData?.percentUsed}
        onUpdated={load}
      />

      <DashboardCharts transactions={transactions} />

      <SpendingAnalytics analytics={analytics} />

      <AiInsights />

      <DashboardOverview accounts={accounts} transactions={transactions || []} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer onCreated={load}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
              <Plus className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>
        {accounts.length > 0 &&
          accounts.map((account) => (
            <AccountCard key={account.id} account={account} onUpdated={load} />
          ))}
      </div>

      <AllTransactions transactions={transactions} onUpdated={load} />
    </div>
  );
}
