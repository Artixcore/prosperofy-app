import type { PAAnalysisResponse } from "@/types/pa";

export function PaIndicatorsCard({ indicators }: { indicators?: PAAnalysisResponse["indicators"] }) {
  if (!indicators || Object.keys(indicators).length === 0) return null;

  const rows: Array<{ label: string; value: string }> = [
    { label: "RSI (14)", value: fmt(indicators.rsi_14) },
    { label: "MACD", value: fmt(indicators.macd_state) },
    { label: "EMA", value: fmt(indicators.ema_state) },
    { label: "ATR", value: fmt(indicators.atr_state) },
    { label: "Bollinger", value: fmt(indicators.bollinger_state) },
    { label: "Volume", value: fmt(indicators.volume_state) },
    { label: "Support", value: fmt(indicators.support) },
    { label: "Resistance", value: fmt(indicators.resistance) },
  ].filter((r) => r.value !== "—");

  return (
    <section className="rounded-lg border border-border bg-card p-4 text-card-foreground">
      <h2 className="text-sm font-medium text-foreground">Indicators</h2>
      <dl className="mt-3 grid gap-2 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between gap-2 text-sm">
            <dt className="text-muted-foreground">{r.label}</dt>
            <dd className="font-medium capitalize text-foreground">{r.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function fmt(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "number") return v.toFixed(1);
  return String(v);
}
