import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Search,
  RefreshCw,
  Clock,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash,
  X,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { cn, formatCurrency } from "@/lib/utils";
import { defaultCategories } from "@/data/categories";
import { createTransaction, bulkDeleteTransactions } from "@/lib/api";

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const SORT_OPTIONS = {
  latest: "Latest",
  oldest: "Oldest",
  highest: "Highest Amount",
  lowest: "Lowest Amount",
};

const PAGE_SIZE = 10;

/** Category id -> readable label, so the table never shows raw ids. */
const CATEGORY_LABELS = defaultCategories.reduce((acc, category) => {
  acc[category.id] = category.name;
  return acc;
}, {});

const INITIAL_FILTERS = {
  search: "",
  type: "ALL",
  category: "ALL",
  from: "",
  to: "",
  sort: "latest",
};

export function AllTransactions({ transactions = [], onUpdated }) {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.type !== "ALL" ||
    filters.category !== "ALL" ||
    filters.from !== "" ||
    filters.to !== "";

  /** Only offer categories the user actually has transactions in. */
  const availableCategories = useMemo(() => {
    const used = new Set(transactions.map((t) => t.category).filter(Boolean));
    return [...used].sort((a, b) =>
      (CATEGORY_LABELS[a] || a).localeCompare(CATEGORY_LABELS[b] || b)
    );
  }, [transactions]);

  const handleEdit = (id) => {
    navigate(`/transaction/create?edit=${id}`);
  };

  const handleDuplicate = async (t) => {
    setBusyId(t.id);
    try {
      await createTransaction({
        type: t.type,
        amount: Number(t.amount),
        description: t.description ? `${t.description} (Copy)` : "",
        date: t.date,
        category: t.category,
        accountId: t.accountId,
        isRecurring: t.isRecurring,
        recurringInterval: t.recurringInterval || undefined,
      });
      toast.success("Transaction duplicated");
      onUpdated?.();
    } catch (err) {
      toast.error(err.message || "Failed to duplicate");
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setBusyId(pendingDelete.id);
    try {
      await bulkDeleteTransactions([pendingDelete.id]);
      toast.success("Transaction deleted");
      setPendingDelete(null);
      onUpdated?.();
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    let result = [...transactions];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          (t.description || "").toLowerCase().includes(q) ||
          (CATEGORY_LABELS[t.category] || t.category || "")
            .toLowerCase()
            .includes(q)
      );
    }

    if (filters.type !== "ALL") {
      result = result.filter((t) => t.type === filters.type);
    }

    if (filters.category !== "ALL") {
      result = result.filter((t) => t.category === filters.category);
    }

    if (filters.from) {
      const from = new Date(filters.from);
      from.setHours(0, 0, 0, 0);
      result = result.filter((t) => new Date(t.date) >= from);
    }

    if (filters.to) {
      const to = new Date(filters.to);
      to.setHours(23, 59, 59, 999);
      result = result.filter((t) => new Date(t.date) <= to);
    }

    const sorters = {
      latest: (a, b) => new Date(b.date) - new Date(a.date),
      oldest: (a, b) => new Date(a.date) - new Date(b.date),
      highest: (a, b) => Number(b.amount) - Number(a.amount),
      lowest: (a, b) => Number(a.amount) - Number(b.amount),
    };

    return result.sort(sorters[filters.sort] || sorters.latest);
  }, [transactions, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              All Transactions
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {filtered.length}{" "}
              {filtered.length === 1 ? "transaction" : "transactions"}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or category..."
                  value={filters.search}
                  onChange={(e) => setFilter("search", e.target.value)}
                  className="pl-8"
                />
              </div>

              <Select
                value={filters.type}
                onValueChange={(v) => setFilter("type", v)}
              >
                <SelectTrigger className="sm:w-[140px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.category}
                onValueChange={(v) => setFilter("category", v)}
              >
                <SelectTrigger className="sm:w-[170px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {availableCategories.map((id) => (
                    <SelectItem key={id} value={id}>
                      {CATEGORY_LABELS[id] || id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.sort}
                onValueChange={(v) => setFilter("sort", v)}
              >
                <SelectTrigger className="sm:w-[170px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SORT_OPTIONS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                From
                <Input
                  type="date"
                  value={filters.from}
                  max={filters.to || undefined}
                  onChange={(e) => setFilter("from", e.target.value)}
                  className="w-[160px]"
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                To
                <Input
                  type="date"
                  value={filters.to}
                  min={filters.from || undefined}
                  onChange={(e) => setFilter("to", e.target.value)}
                  className="w-[160px]"
                />
              </label>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilters(INITIAL_FILTERS);
                    setPage(1);
                  }}
                  className="sm:ml-auto"
                >
                  <X className="mr-1 h-4 w-4" />
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <Inbox className="h-8 w-8 text-muted-foreground" />
                      <p className="font-medium">No transactions found</p>
                      <p className="text-sm text-muted-foreground">
                        {hasActiveFilters
                          ? "Try adjusting your filters or clearing them."
                          : "Add your first transaction to see it here."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(t.date), "PP")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {t.description || "Untitled Transaction"}
                    </TableCell>
                    <TableCell>
                      {CATEGORY_LABELS[t.category] || t.category}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "border-transparent",
                          t.type === "INCOME"
                            ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15"
                            : "bg-rose-500/15 text-rose-600 hover:bg-rose-500/15"
                        )}
                      >
                        {t.type}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "whitespace-nowrap text-right font-semibold",
                        t.type === "INCOME"
                          ? "text-emerald-600"
                          : "text-rose-600"
                      )}
                    >
                      {t.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(t.amount)}
                    </TableCell>
                    <TableCell>
                      {t.isRecurring ? (
                        <Badge className="gap-1 border-transparent bg-accent text-accent-foreground hover:bg-accent/80">
                          <RefreshCw className="h-3 w-3" />
                          {RECURRING_INTERVALS[t.recurringInterval] ||
                            "Recurring"}
                        </Badge>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          One-time
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            disabled={busyId === t.id}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(t.id)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(t)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setPendingDelete(t)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this transaction?"
        description={
          pendingDelete
            ? `"${
                pendingDelete.description || "Untitled Transaction"
              }" will be removed and your account balance will be adjusted. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        loading={busyId === pendingDelete?.id}
        onConfirm={confirmDelete}
      />
    </Card>
  );
}
