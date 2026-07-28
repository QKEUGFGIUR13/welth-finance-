import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-mist/60 via-background to-background" />
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-pine/15 blur-3xl" />
        <div className="absolute top-10 right-0 h-80 w-80 rounded-full bg-accent/50 blur-3xl" />
        <div className="absolute inset-0 surface-grid opacity-40" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-36 pb-20 sm:pt-44 sm:pb-28">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <span
              className="inline-flex items-center gap-2 rounded-full border border-pine/20 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-pine backdrop-blur animate-fade-up"
              style={{ animationDelay: "0.05s" }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI-powered finance, minus the noise
            </span>

            <h1
              className="mt-6 font-display text-5xl sm:text-6xl md:text-7xl leading-[0.98] tracking-tight text-ink text-balance animate-fade-up"
              style={{ fontWeight: 700, animationDelay: "0.14s" }}
            >
              Clarity for every
              <span className="block text-pine">dollar you move.</span>
            </h1>

            <p
              className="mt-6 max-w-md text-lg text-muted-foreground animate-fade-up"
              style={{ animationDelay: "0.26s" }}
            >
              Track accounts, scan receipts, and surface spending patterns with
              AI — built for calm, precise money management.
            </p>

            <div
              className="mt-9 flex flex-wrap gap-3 animate-fade-up"
              style={{ animationDelay: "0.36s" }}
            >
              <Link to="/dashboard">
                <Button size="lg" className="h-11 px-7 text-base">
                  Open dashboard
                </Button>
              </Link>
              <a href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 px-7 text-base"
                >
                  Explore features
                </Button>
              </a>
            </div>

            <div
              className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground animate-fade-up"
              style={{ animationDelay: "0.46s" }}
            >
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-pine" />
                Bank-grade privacy
              </span>
              <span className="inline-flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-pine" />
                Real-time insights
              </span>
            </div>
          </div>

          <div
            className="relative animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  const bars = [42, 58, 35, 72, 50, 88, 64, 96, 70];

  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-pine/10 to-accent/40 blur-2xl" />
      <div className="relative rounded-2xl border border-border/80 bg-card/90 p-5 shadow-xl shadow-ink/5 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Total balance
            </p>
            <p className="mt-1 font-display text-3xl text-ink" style={{ fontWeight: 700 }}>
              $24,580.20
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-pine/10 px-2.5 py-1 text-xs font-semibold text-pine">
            <ArrowUpRight className="h-3.5 w-3.5" />
            +12.4%
          </span>
        </div>

        <div className="mt-6 flex h-32 items-end gap-2">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-md bg-gradient-to-t from-pine/30 to-pine"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {[
            { name: "Groceries", amount: "-$82.40", up: false },
            { name: "Salary", amount: "+$4,200.00", up: true },
            { name: "Utilities", amount: "-$134.10", up: false },
          ].map((tx) => (
            <div
              key={tx.name}
              className="flex items-center justify-between rounded-lg border border-border/70 bg-background/60 px-3.5 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={
                    "flex h-8 w-8 items-center justify-center rounded-md " +
                    (tx.up ? "bg-pine/10 text-pine" : "bg-muted text-muted-foreground")
                  }
                >
                  {tx.up ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                </span>
                <span className="text-sm font-medium text-ink">{tx.name}</span>
              </div>
              <span
                className={
                  "text-sm font-semibold " +
                  (tx.up ? "text-pine" : "text-foreground/80")
                }
              >
                {tx.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-border/80 bg-card px-4 py-3 shadow-lg sm:block">
        <p className="text-[11px] font-medium text-muted-foreground">
          Monthly budget
        </p>
        <div className="mt-1.5 h-1.5 w-32 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-2/3 rounded-full bg-pine" />
        </div>
        <p className="mt-1.5 text-xs font-semibold text-ink">67% used</p>
      </div>
    </div>
  );
}
