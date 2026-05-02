import type { MarketSignal } from "@/types/signals";

export function SignalRiskBadge({ riskScore }: { riskScore: MarketSignal["risk_score"] }) {
  const tone =
    riskScore >= 70
      ? "bg-rose-100 text-rose-900 ring-rose-400 dark:bg-rose-950/55 dark:text-rose-100 dark:ring-rose-800/80"
      : riskScore >= 40
        ? "bg-amber-100 text-amber-950 ring-amber-400 dark:bg-amber-950/50 dark:text-amber-100 dark:ring-amber-800/70"
        : "bg-emerald-100 text-emerald-950 ring-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-100 dark:ring-emerald-800/60";

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tone}`}>
      Risk {riskScore}
    </span>
  );
}
