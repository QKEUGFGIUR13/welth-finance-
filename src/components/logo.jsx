import { cn } from "@/lib/utils";

/**
 * Welth brand mark — a stylized "W" formed from an upward trend line,
 * paired with the wordmark. Uses the pine/ink theme.
 */
export function Logo({ className, showText = true, textClassName }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-pine text-white shadow-sm">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            d="M3 6l3.5 12L12 9l5.5 9L21 6"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {showText && (
        <span
          className={cn(
            "font-display text-xl tracking-tight text-ink",
            textClassName
          )}
          style={{ fontWeight: 700 }}
        >
          Welth
        </span>
      )}
    </span>
  );
}
