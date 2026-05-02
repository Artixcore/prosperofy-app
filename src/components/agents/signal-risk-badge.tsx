import type { MarketSignal } from "@/types/signals";

export function SignalRiskBadge({ riskScore }: { riskScore: MarketSignal["risk_score"] }) {
  const tone =
    riskScore >= 70
      ? "bg-rose-950/60 text-rose-200 ring-rose-800/80"
      : riskScore >= 40
        ? "bg-amber-950/50 text-amber-200 ring-amber-800/70"
        : "bg-emerald-950/40 text-emerald-200 ring-emerald-800/60";

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tone}`}>
      Risk {riskScore}
    </span>
  );
}
