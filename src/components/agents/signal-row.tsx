import Link from "next/link";
import type { MarketSignal } from "@/types/signals";
import { ConfidenceMeter } from "@/components/agents/confidence-meter";
import { SignalRiskBadge } from "@/components/agents/signal-risk-badge";

export function SignalRow({ signal }: { signal: MarketSignal }) {
  return (
    <tr className="border-b border-surface-border text-sm text-zinc-300">
      <td className="py-2 pr-4 font-medium text-white">{signal.symbol}</td>
      <td className="py-2 pr-4">{signal.market_type}</td>
      <td className="py-2 pr-4 capitalize">{signal.direction}</td>
      <td className="py-2 pr-4">
        <ConfidenceMeter value={signal.confidence_score} />
      </td>
      <td className="py-2 pr-4">
        <SignalRiskBadge riskScore={signal.risk_score} />
      </td>
      <td className="py-2 pr-4">{signal.timeframe}</td>
      <td className="py-2 pr-4">{signal.status}</td>
      <td className="py-2 text-right">
        <Link href={`/agents/signals/${signal.id}`} className="text-sky-400 hover:text-sky-300">
          Details
        </Link>
      </td>
    </tr>
  );
}
