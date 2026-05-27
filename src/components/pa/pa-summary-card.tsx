import { ConfidenceMeter } from "@/components/agents/confidence-meter";
import type { PAAnalysisResponse } from "@/types/pa";

const ACTION_STYLES: Record<string, string> = {
  buy: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100",
  sell: "bg-rose-100 text-rose-900 dark:bg-rose-950/50 dark:text-rose-100",
  watch: "bg-sky-100 text-sky-900 dark:bg-sky-950/50 dark:text-sky-100",
  hold: "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100",
  avoid: "bg-amber-100 text-amber-950 dark:bg-amber-950/50 dark:text-amber-100",
  no_trade: "bg-amber-100 text-amber-950 dark:bg-amber-950/50 dark:text-amber-100",
};

export function PaSummaryCard({ data }: { data: PAAnalysisResponse }) {
  const action = (data.signal?.action ?? "watch").toLowerCase();
  const confidencePct =
    data.signal?.confidence !== undefined
      ? Math.round(data.signal.confidence * 100)
      : null;
  const riskLevel = data.signal?.risk_level;

  return (
    <section className="rounded-lg border border-border bg-card p-4 text-card-foreground">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="inline-flex rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {data.model}
          </span>
          <h2 className="mt-2 text-xl font-semibold text-foreground">
            {data.symbol}{" "}
            <span className="text-base font-normal text-muted-foreground">· {data.timeframe}</span>
          </h2>
          {data.price ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Price: <span className="font-medium text-foreground">{data.price}</span>
            </p>
          ) : null}
          {data.data_freshness ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Data: <span className="font-medium text-foreground">{data.data_freshness}</span>
            </p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold capitalize ${ACTION_STYLES[action] ?? ACTION_STYLES.watch}`}
          >
            {action.replace(/_/g, " ")}
          </span>
          {confidencePct !== null ? <ConfidenceMeter value={confidencePct} /> : null}
          {riskLevel ? (
            <span className="text-xs capitalize text-muted-foreground">
              Risk: <span className="font-medium text-foreground">{riskLevel}</span>
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
