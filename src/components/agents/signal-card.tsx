import Link from "next/link";
import type { MarketSignal } from "@/types/signals";
import { ConfidenceMeter } from "@/components/agents/confidence-meter";
import { SignalRiskBadge } from "@/components/agents/signal-risk-badge";

export function SignalCard({ signal }: { signal: MarketSignal }) {
  return (
    <article className="rounded-lg border border-surface-border bg-surface-raised/25 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">{signal.symbol}</h3>
          <p className="mt-1 text-xs capitalize text-zinc-500">
            {signal.direction} · {signal.market_type} · {signal.timeframe}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SignalRiskBadge riskScore={signal.risk_score} />
          <ConfidenceMeter value={signal.confidence_score} />
        </div>
      </div>
      {signal.reasoning ? (
        <p className="mt-3 text-sm text-zinc-400">{signal.reasoning}</p>
      ) : null}
      {signal.disclaimer ? (
        <p className="mt-3 text-xs leading-relaxed text-amber-200/90">{signal.disclaimer}</p>
      ) : null}
      <div className="mt-4 flex justify-end">
        <Link href={`/agents/signals/${signal.id}`} className="text-xs font-medium text-sky-400 hover:text-sky-300">
          Details →
        </Link>
      </div>
    </article>
  );
}
