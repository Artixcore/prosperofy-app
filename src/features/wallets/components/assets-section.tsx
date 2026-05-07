"use client";

import { Coins } from "lucide-react";
import Link from "next/link";
import { LoadingState } from "@/components/system/loading-state";
import type { WalletAssetItem } from "@/lib/api/types";
import { formatChainName } from "@/lib/formatters";

type Props = {
  assets: WalletAssetItem[] | undefined;
  isLoading: boolean;
};

/**
 * Compact assets list for the dashboard. Shows symbol, network, and the
 * cached on-chain balance if available. The full assets table lives at
 * `/wallet/assets`. USD valuation is intentionally a "—" placeholder until
 * pricing is wired into the backend `summary.total_balance` aggregator.
 */
export function AssetsSection({ assets, isLoading }: Props) {
  return (
    <section
      className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-soft"
      aria-label="Assets"
    >
      <header className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-content-primary">
            Assets
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Tokens detected across your WFL Wallet networks.
          </p>
        </div>
        <Link
          href="/wallet/assets"
          className="text-sm font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </header>

      {isLoading ? (
        <LoadingState label="Loading assets…" className="!py-8" />
      ) : !assets || assets.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background/40 px-4 py-10 text-center">
          <Coins className="h-6 w-6 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium text-content-primary">No assets found yet.</p>
          <p className="text-xs text-muted-foreground">
            Once you receive tokens, they appear here automatically.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {assets.map((asset) => (
            <li
              key={asset.id}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase text-content-primary">
                  {(asset.symbol ?? "—").slice(0, 3)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-content-primary">
                    {asset.name ?? asset.symbol}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {asset.symbol} · {formatChainName(asset.chain)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm text-content-primary">
                  {asset.balance_cache ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground">—</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
