"use client";

import { PageHeader } from "@/components/page-header";
import { InlineAlert } from "@/components/system/inline-alert";
import { LoadingState } from "@/components/system/loading-state";
import { usePortfolioOverview } from "@/features/portfolio/use-portfolio";
import { normalizeApiError } from "@/lib/api/normalize-api-error";

export default function PortfolioPage() {
  const overview = usePortfolioOverview();

  if (overview.isLoading) {
    return <LoadingState label="Loading portfolio…" />;
  }

  if (overview.isError) {
    return (
      <div className="space-y-4">
        <PageHeader title="Portfolio" description="Wallet holdings and market valuation." />
        <InlineAlert tone="error">{normalizeApiError(overview.error)}</InlineAlert>
      </div>
    );
  }

  const data = overview.data;
  const balances = Array.isArray(data?.wallet_balances) ? data.wallet_balances : [];
  const prices = Array.isArray(data?.market_prices) ? data.market_prices : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Portfolio"
        description="Wallet holdings valued with live Binance/CoinGecko prices via Prosperofy backend."
      />
      <p className="text-xs text-muted-foreground">
        Source: {data?.source ?? "mixed"} — informational only, not financial advice.
      </p>
      {(data as { market_quotes_status?: string })?.market_quotes_status === "unavailable" ? (
        <InlineAlert tone="warning">
          Live market prices are temporarily unavailable. Holdings are shown from your last synced balance.
        </InlineAlert>
      ) : null}
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Holdings</h2>
        {balances.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No wallet assets yet.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {balances.map((row, i) => (
              <li key={i} className="flex justify-between gap-4">
                <span>{String((row as { symbol?: string }).symbol ?? "Asset")}</span>
                <span className="tabular-nums">
                  {String((row as { balance?: string }).balance ?? "—")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Market prices</h2>
        {prices.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Market prices temporarily unavailable.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {prices.map((row, i) => {
              const q = row as { symbol?: string; price?: string; last?: string; is_live?: boolean };
              return (
                <li key={i} className="flex justify-between gap-4">
                  <span>{q.symbol ?? "—"}</span>
                  <span className="tabular-nums">
                    {q.price ?? q.last ?? "—"}{" "}
                    {q.is_live ? (
                      <span className="text-emerald-600 text-xs">live</span>
                    ) : (
                      <span className="text-amber-600 text-xs">cached</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
