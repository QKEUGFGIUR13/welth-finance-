import { useState } from "react";
import {
  AlertCircle,
  Lightbulb,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
} from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { getAiInsights } from "@/lib/api";

/**
 * AI Insights.
 *
 * Generated on demand rather than on page load: the LLM call is slow and
 * costs money, so we only run it when the user asks for it.
 */
export function AiInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const result = await getAiInsights();
      setInsights(result);
    } catch (err) {
      toast.error(err.message || "Could not generate insights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-pine" />
          <CardTitle className="text-base">AI Financial Advisor</CardTitle>
          {insights?.source === "rules" && (
            <Badge variant="secondary" className="text-xs">
              Offline mode
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          variant={insights ? "outline" : "default"}
          onClick={generate}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : insights ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate
            </>
          ) : (
            "Get Insights"
          )}
        </Button>
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-3/4" />
            <div className="pt-2 space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        )}

        {!loading && !insights && (
          <p className="py-4 text-sm text-muted-foreground">
            Get a plain-English review of this month&apos;s spending, three
            personalised saving tips, and a suggested budget for next month.
          </p>
        )}

        {!loading && insights && (
          <div className="space-y-5">
            <div>
              <p className="text-sm leading-relaxed">{insights.analysis}</p>
            </div>

            {insights.savingTips?.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Ways to Save
                </h4>
                <ul className="space-y-2">
                  {insights.savingTips.map((tip, index) => (
                    <li
                      key={index}
                      className="flex gap-2 rounded-md border bg-muted/40 p-3 text-sm"
                    >
                      <span className="font-semibold text-pine">
                        {index + 1}.
                      </span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {insights.unnecessarySpending && (
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <AlertCircle className="h-4 w-4 text-rose-500" />
                  Unnecessary Spending
                </h4>
                <p className="rounded-md border border-rose-100 bg-rose-50 p-3 text-sm text-rose-800">
                  {insights.unnecessarySpending}
                </p>
              </div>
            )}

            {insights.recommendedBudget?.amount > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <Target className="h-4 w-4 text-emerald-600" />
                  Recommended Budget for Next Month
                </h4>
                <div className="rounded-md border border-emerald-100 bg-emerald-50 p-3">
                  <p className="text-xl font-semibold text-emerald-700">
                    {formatCurrency(insights.recommendedBudget.amount, {
                      decimals: 0,
                    })}
                  </p>
                  <p className="text-sm text-emerald-800">
                    {insights.recommendedBudget.reason}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
