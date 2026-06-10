"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { InlineAlert } from "@/components/system/inline-alert";
import { LoadingState } from "@/components/system/loading-state";
import {
  CRYPTO_SYMBOLS,
  type ChartTimeframe,
} from "@/components/market/market-chart-utils";
import { MarketOverviewSection } from "@/components/market/market-overview-section";
import { MarketPriceChart } from "@/components/market/market-price-chart";
import { usePortfolioOverview } from "@/features/portfolio/use-portfolio";
import { normalizeApiError } from "@/lib/api/normalize-api-error";

export default function PortfolioPage() {
  const overview = usePortfolioOverview();
  const [chartSymbol, setChartSymbol] = useState<string>(CRYPTO_SYMBOLS[0]);
  const [chartTimeframe, setChartTimeframe] = useState<ChartTimeframe>("1h");

  const data = overview.data;
  const balances = Array.isArray(data?.wallet_balances) ? data.wallet_balances : [];

  return (
    <div className="w-full min-w-0 max-w-full space-y-6">
      <PageHeader
        title="Portfolio"
        description="Wallet holdings and live crypto market data via Prosperofy backend."
      />

      {overview.isLoading ? (
        <LoadingState label="Loading portfolio…" />
      ) : overview.isError ? (
        <InlineAlert tone="warning">{normalizeApiError(overview.error)}</InlineAlert>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Source: {data?.source ?? "mixed"} — informational only, not financial advice.
          </p>
          {(data as { market_quotes_status?: string })?.market_quotes_status === "unavailable" ? (
            <InlineAlert tone="warning">
              Live market prices are temporarily unavailable. Holdings are shown from your last synced
              balance.
            </InlineAlert>
          ) : null}

          <section className="grid w-full min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="min-w-0 rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-semibold">Holdings count</h2>
              <p className="mt-2 text-2xl font-semibold tabular-nums">{balances.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">Wallet assets tracked</p>
            </div>
            <div className="min-w-0 rounded-xl border border-border bg-card p-4 sm:col-span-2">
              <h2 className="text-sm font-semibold">Portfolio summary</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {balances.length === 0
                  ? "No wallet assets yet. Create your WFL wallet to see holdings here."
                  : `${balances.length} asset${balances.length === 1 ? "" : "s"} in your wallet.`}
              </p>
            </div>
          </section>
        </>
      )}

      <MarketOverviewSection symbols={CRYPTO_SYMBOLS} />

      <MarketPriceChart
        symbol={chartSymbol}
        timeframe={chartTimeframe}
        symbols={CRYPTO_SYMBOLS}
        onSymbolChange={setChartSymbol}
        onTimeframeChange={setChartTimeframe}
      />

      <section className="w-full min-w-0 max-w-full rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Holdings</h2>
        {overview.isLoading ? (
          <p className="mt-2 text-sm text-muted-foreground">Loading holdings…</p>
        ) : balances.length === 0 ? (
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
    </div>
  );
}
