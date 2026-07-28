import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { BarLoader } from "react-spinners";
import { getAccountWithTransactions } from "@/lib/api";
import { TransactionTable } from "@/pages/account/transaction-table";
import { AccountChart } from "@/pages/account/account-chart";

export default function AccountPage() {
  const { id } = useParams();
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAccountWithTransactions(id);
      setAccountData(data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (loading) {
    return <BarLoader className="mt-4" width="100%" color="#1A7A66" />;
  }

  if (notFound || !accountData) {
    return <Navigate to="/dashboard" replace />;
  }

  const { transactions, ...account } = accountData;

  return (
    <div className="space-y-8 px-5">
      <div className="flex gap-4 items-end justify-between">
        <div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight gradient-title capitalize">
            {account.name}
          </h1>
          <p className="text-muted-foreground">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()}{" "}
            Account
          </p>
        </div>

        <div className="text-right pb-2">
          <div className="text-xl sm:text-2xl font-bold">
            ${parseFloat(account.balance).toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground">
            {account._count.transactions} Transactions
          </p>
        </div>
      </div>

      <AccountChart transactions={transactions} />
      <TransactionTable transactions={transactions} onUpdated={load} />
    </div>
  );
}
