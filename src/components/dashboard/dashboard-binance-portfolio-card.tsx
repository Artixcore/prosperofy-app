"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ErrorState } from "@/components/system/error-state";
import { InlineAlert } from "@/components/system/inline-alert";
import { LoadingState } from "@/components/system/loading-state";
import {
  useExchangeConnectionsQuery,
  useExchangePortfolioQuery,
} from "@/features/exchanges/use-exchange-connections";
import type { ExchangeConnectionSummary } from "@/lib/api/types";

function findActiveBinance(connections: ExchangeConnectionSummary[]): ExchangeConnectionSummary | null {
  return (
    connections.find(
      (c) =>
        (c.exchange === "binance" || c.provider === "binance") &&
        c.id &&
        c.status !== "not_connected" &&
        c.status !== "revoked",
    ) ?? null
  );
}

export function DashboardBinancePortfolioCard() {
  const connectionsQuery = useExchangeConnectionsQuery();
  const binance = useMemo(() => {
    const list = connectionsQuery.data?.connections ?? connectionsQuery.data?.exchanges ?? [];
    return findActiveBinance(list);
  }, [connectionsQuery.data]);

  const portfolioQuery = useExchangePortfolioQuery(binance?.id ?? null);

  if (connectionsQuery.isPending) {
    return (
      <section className="min-w-0 rounded-2xl border border-surface-border bg-surface-elevated p-5 shadow-soft">
        <LoadingState label="Loading Binance connection..." />
      </section>
    );
  }

  if (!binance?.id) {
    return (
      <section className="min-w-0 rounded-2xl border border-surface-border bg-surface-elevated p-5 shadow-soft">
        <h2 className="text-base font-semibold text-content-primary">Binance portfolio</h2>
        <p className="mt-1 text-sm text-content-muted">Connect Binance to view exchange balances on your dashboard.</p>
        <Link
          href="/settings/exchange-connections"
          className="mt-4 inline-flex rounded-lg border border-surface-border px-3 py-2 text-sm text-content-primary hover:bg-surface-raised"
        >
          Exchange Connections
        </Link>
      </section>
    );
  }

  return (
    <section className="min-w-0 rounded-2xl border border-surface-border bg-surface-elevated p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-content-primary">Binance portfolio</h2>
          <p className="mt-1 text-sm text-content-muted">
            Status: {binance.status}
            {binance.last_synced_at
              ? ` · Last synced ${new Date(binance.last_synced_at).toLocaleString()}`
              : ""}
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg border border-surface-border px-3 py-1.5 text-xs text-content-primary hover:bg-surface-raised"
          onClick={() => void portfolioQuery.refetch()}
        >
          Refresh
        </button>
      </div>

      <div className="mt-4">
        {portfolioQuery.isPending ? (
          <LoadingState label="Syncing Binance balances..." />
        ) : portfolioQuery.isError ? (
          <ErrorState
            error={portfolioQuery.error}
            title="Binance portfolio unavailable"
            onRetry={() => void portfolioQuery.refetch()}
          />
        ) : (portfolioQuery.data?.balances?.length ?? 0) === 0 ? (
          <InlineAlert tone="info">No non-zero Binance balances returned.</InlineAlert>
        ) : (
          <ul className="space-y-2">
            {portfolioQuery.data!.balances.slice(0, 6).map((row) => (
              <li
                key={row.asset}
                className="flex items-center justify-between rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm"
              >
                <span className="font-medium text-content-primary">{row.asset}</span>
                <span className="tabular-nums text-content-muted">
                  {row.free} free · {row.locked} locked
                </span>
              </li>
            ))}
          </ul>
        )}
        {portfolioQuery.data && !portfolioQuery.data.valuation_available ? (
          <p className="mt-3 text-xs text-content-muted">Total valuation unavailable.</p>
        ) : null}
      </div>

      <Link
        href="/settings/exchange-connections"
        className="mt-4 inline-flex text-sm text-emerald-700 hover:underline dark:text-emerald-300"
      >
        Manage connection
      </Link>
    </section>
  );
}
