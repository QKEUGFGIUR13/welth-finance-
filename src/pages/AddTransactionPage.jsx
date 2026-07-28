import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BarLoader } from "react-spinners";
import { getUserAccounts, getTransaction } from "@/lib/api";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "@/pages/transaction/transaction-form";

export default function AddTransactionPage() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const [accounts, setAccounts] = useState([]);
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const accountsData = await getUserAccounts();
        setAccounts(accountsData || []);

        if (editId) {
          const transaction = await getTransaction(editId);
          setInitialData(transaction);
        } else {
          setInitialData(null);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [editId]);

  if (loading) {
    return <BarLoader className="mt-4" width="100%" color="#1A7A66" />;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="max-w-3xl mx-auto px-5">
      <div className="flex justify-center md:justify-normal mb-8">
        <h1 className="text-5xl gradient-title ">
          {editId ? "Edit Transaction" : "Add Transaction"}
        </h1>
      </div>
      <AddTransactionForm
        accounts={accounts}
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData}
      />
    </div>
  );
}
