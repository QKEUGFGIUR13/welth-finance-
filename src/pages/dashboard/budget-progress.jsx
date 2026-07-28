"use client";

import { useState, useEffect } from "react";
import { Pencil, Check, X, AlertTriangle } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import { updateBudget } from "@/lib/api";

/** Show a warning once the user has spent this share of their budget. */
const WARNING_THRESHOLD = 80;

export function BudgetProgress({
  initialBudget,
  currentExpenses,
  remaining,
  percentUsed,
  onUpdated,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );
  const [validationError, setValidationError] = useState("");

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updatedBudget,
    error,
  } = useFetch(updateBudget);

  const budgetAmount = initialBudget?.amount || 0;
  // Fall back to local maths so the card still works if the API omits them.
  const used =
    percentUsed ?? (budgetAmount > 0 ? (currentExpenses / budgetAmount) * 100 : 0);
  const left = remaining ?? budgetAmount - currentExpenses;

  const isOverBudget = budgetAmount > 0 && left < 0;
  const isWarning = budgetAmount > 0 && used >= WARNING_THRESHOLD;

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);

    if (Number.isNaN(amount)) {
      setValidationError("Please enter a number");
      return;
    }
    if (amount <= 0) {
      setValidationError("Budget must be greater than 0");
      return;
    }

    setValidationError("");
    await updateBudgetFn(amount);
  };

  const handleCancel = () => {
    setNewBudget(initialBudget?.amount?.toString() || "");
    setValidationError("");
    setIsEditing(false);
  };

  useEffect(() => {
    if (updatedBudget?.success) {
      setIsEditing(false);
      toast.success("Budget updated successfully");
      onUpdated?.();
    }
  }, [updatedBudget, onUpdated]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update budget");
    }
  }, [error]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex-1">
          <CardTitle className="text-sm font-medium">
            Monthly Budget (Default Account)
          </CardTitle>
          <div className="mt-2 flex items-center gap-2">
            {isEditing ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-32"
                    placeholder="Enter amount"
                    autoFocus
                    disabled={isLoading}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleUpdateBudget}
                    disabled={isLoading}
                  >
                    <Check className="h-4 w-4 text-emerald-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 text-rose-600" />
                  </Button>
                </div>
                {validationError && (
                  <p className="text-xs text-rose-600">{validationError}</p>
                )}
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {initialBudget
                    ? `${formatCurrency(currentExpenses)} of ${formatCurrency(
                        budgetAmount
                      )} spent`
                    : "No budget set"}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="h-6 w-6"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {initialBudget ? (
          <div className="space-y-3">
            <Progress
              value={Math.min(used, 100)}
              extraStyles={
                used >= 100
                  ? "bg-rose-600"
                  : used >= WARNING_THRESHOLD
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }
            />

            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span
                className={cn(
                  "font-medium",
                  isOverBudget ? "text-rose-600" : "text-emerald-700"
                )}
              >
                {isOverBudget
                  ? `${formatCurrency(Math.abs(left))} over budget`
                  : `${formatCurrency(left)} remaining`}
              </span>
              <span className="text-muted-foreground">
                {used.toFixed(1)}% used
              </span>
            </div>

            {isWarning && (
              <div
                className={cn(
                  "flex items-start gap-2 rounded-md border p-3 text-sm",
                  isOverBudget
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-amber-200 bg-amber-50 text-amber-800"
                )}
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  {isOverBudget
                    ? "You have exceeded your monthly budget. Review your recent expenses."
                    : `You have used ${used.toFixed(
                        0
                      )}% of your monthly budget. Slow down to stay on track.`}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Set a monthly budget to track how much you have left to spend.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
