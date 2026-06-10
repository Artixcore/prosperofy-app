import type { MarketQuotePayload } from "@/features/market/use-market-quote";

function LiveBadge({ q }: { q: MarketQuotePayload }) {
  const live = Boolean(q.is_live);
  const src = (q.source ?? "").toLowerCase();
  const label = live && src !== "cached" ? "Live / recent" : "Cached or delayed";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        live && src !== "cached"
          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
          : "bg-amber-500/15 text-amber-800 dark:text-amber-200"
      }`}
    >
      {label}
    </span>
  );
}

export function MarketQuoteCard({ row }: { row: MarketQuotePayload }) {
  const label = row.display_symbol || row.symbol || "—";
  const mid = row.mid ?? row.last ?? row.price ?? "—";
  const change = row.change_percentage_24h ?? row.change_24h_percent ?? null;
  const volume = row.volume_24h ?? row.volume ?? null;

  return (
    <div className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{label}</p>
          <p className="truncate text-xs text-muted-foreground">{row.symbol}</p>
        </div>
        <LiveBadge q={row} />
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-foreground">{mid}</p>
      {change != null && change !== "" ? (
        <p className="mt-1 text-xs tabular-nums text-muted-foreground">24h: {change}%</p>
      ) : null}
      {volume != null && volume !== "" ? (
        <p className="mt-1 text-xs tabular-nums text-muted-foreground">Vol 24h: {volume}</p>
      ) : null}
    </div>
  );
}

export function MarketQuoteCardSkeleton() {
  return (
    <div className="min-w-0 animate-pulse rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="h-4 w-24 rounded bg-muted" />
      <div className="mt-2 h-3 w-16 rounded bg-muted" />
      <div className="mt-4 h-8 w-32 rounded bg-muted" />
      <div className="mt-2 h-3 w-20 rounded bg-muted" />
    </div>
  );
}
