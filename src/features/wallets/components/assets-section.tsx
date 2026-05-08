"use client";

import { Coins } from "lucide-react";
import Link from "next/link";
import { LoadingState } from "@/components/system/loading-state";
import type { WalletAssetItem } from "@/lib/api/types";
import { formatChainName, formatRelativeTime } from "@/lib/formatters";

type Props = {
  assets: WalletAssetItem[] | undefined;
  isLoading: boolean;
  /** ISO8601 timestamp of the most recent on-chain sync, if any. */
  lastSyncedAt?: string | null;
};

/**
 * Compact assets list for the dashboard. Shows symbol, network, and the
 * cached on-chain balance if available. The full assets table lives at
 * `/wallet/assets`. USD valuation is intentionally a "—" placeholder until
 * pricing is wired into the backend `summary.total_balance` aggregator.
 */
export function AssetsSection({ assets, isLoading, lastSyncedAt }: Props) {
  const nativeAssets = buildNativeAssetRows(assets);

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
            {lastSyncedAt ? (
              <>
                {" "}
                <span className="text-content-muted">Last synced {formatRelativeTime(lastSyncedAt)}.</span>
              </>
            ) : null}
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
            Once you receive tokens, click Refresh Balance on the wallet page if they don&apos;t appear automatically.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {nativeAssets.map((asset) => {
            const networkLabel = asset.network ?? asset.chain ?? "—";
            const balance = asset.balance ?? asset.balance_cache ?? "—";
            const tooltip =
              asset.raw_balance && asset.decimals !== null && asset.decimals !== undefined
                ? `${asset.raw_balance} (10^${asset.decimals})`
                : undefined;
            return (
              <li
                key={asset.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase text-content-primary">
                    {(asset.symbol ?? "—").slice(0, 3)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-content-primary">{asset.symbol}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {asset.symbol} · {formatChainName(networkLabel)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-content-primary" title={tooltip}>
                    {balance}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function buildNativeAssetRows(assets: WalletAssetItem[] | undefined): WalletAssetItem[] {
  const defaults: WalletAssetItem[] = [
    { id: -1, symbol: "SOL", network: "solana", balance: "0.000000000", decimals: 9, token_address: null },
    { id: -2, symbol: "BTC", network: "bitcoin", balance: "0.00000000", decimals: 8, token_address: null },
    { id: -3, symbol: "ETH", network: "ethereum", balance: "0.000000", decimals: 18, token_address: null },
  ];

  if (!assets || assets.length === 0) return defaults;

  return defaults.map((fallback) => {
    const found = assets.find(
      (asset) =>
        (asset.symbol ?? "").toUpperCase() === fallback.symbol &&
        (asset.asset_type === "native" || fallback.symbol === "BTC" || !asset.asset_type)
    );
    if (!found) return fallback;
    return { ...fallback, ...found };
  });
}

