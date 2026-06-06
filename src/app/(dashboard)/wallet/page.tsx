"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useRef } from "react";
import { ErrorState } from "@/components/system/error-state";
import { LoadingState } from "@/components/system/loading-state";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/components/system/toast-context";
import { AssetsSection } from "@/features/wallets/components/assets-section";
import { ConnectedWalletsSection } from "@/features/wallets/components/connected-wallets-section";
import { RecentTransactionsSection } from "@/features/wallets/components/recent-transactions-section";
import { WalletTransactionsChartSection } from "@/features/wallets/components/wallet-transactions-chart-section";
import { WalletBalanceCard } from "@/features/wallets/components/wallet-balance-card";
import { WflWalletStatusBanner } from "@/features/wallets/components/wfl-wallet-status-banner";
import {
  useAppWalletAssetsQuery,
  useAppWalletOverviewQuery,
  useWalletFullRefreshMutation,
} from "@/features/wallets/use-wallet-mutations";
import { useWalletTransactionsQuery } from "@/features/wallets/use-wallet-send";
import { wflWalletState } from "@/features/wallets/wallet-derive";
import { normalizeApiError } from "@/lib/api/normalize-api-error";

export default function WalletPage() {
  const overview = useAppWalletOverviewQuery();
  const assets = useAppWalletAssetsQuery();
  const refreshMu = useWalletFullRefreshMutation();
  const txs = useWalletTransactionsQuery({ per_page: 5 });
  const { pushToast } = useToast();
  const autoSyncedRef = useRef(false);

  const walletState = wflWalletState(overview.data);
  const refreshing =
    refreshMu.isPending || overview.isFetching || assets.isFetching || txs.isFetching;

  const hasPendingTx = (txs.data?.transactions ?? []).some((tx) =>
    ["pending", "broadcasted", "previewed"].includes(tx.status),
  );

  const lastSyncedAt =
    refreshMu.data?.assets.last_synced_at ??
    assets.data?.last_synced_at ??
    overview.data?.last_synced_at ??
    null;

  const runFullRefresh = async (options?: { silent?: boolean }) => {
    try {
      const result = await refreshMu.mutateAsync();
      const { sync, assets: assetsResult } = result;

      if (!options?.silent) {
        if (sync.not_implemented) {
          pushToast({
            tone: "info",
            title: "Deposit sync unavailable",
            description:
              "Incoming receive history is not enabled on this deployment yet.",
          });
        } else if (sync.balance_refresh_error) {
          pushToast({
            tone: "warning",
            title: "Transactions synced",
            description:
              sync.balance_refresh_error.message ||
              "Balance could not be refreshed. Please try again.",
          });
        } else {
          pushToast({
            tone: assetsResult.from_cache ? "info" : "success",
            title: assetsResult.from_cache ? "Already up to date" : "Wallet refreshed",
            description: assetsResult.from_cache
              ? "Your wallet was synced very recently."
              : `Synced ${sync.synced_count} transaction(s) and loaded the latest on-chain balance.`,
          });
        }
      }

      return result;
    } catch (error) {
      if (!options?.silent) {
        pushToast({
          tone: "error",
          title: "Could not refresh wallet",
          description:
            normalizeApiError(error, "wallet-refresh") ||
            "Wallet refresh failed. Please try again shortly.",
        });
      }
    }
  };

  useEffect(() => {
    if (autoSyncedRef.current) return;
    if (walletState.status !== "active") return;
    if (overview.isPending) return;

    autoSyncedRef.current = true;
    void runFullRefresh({ silent: true }).catch(() => {
      // Errors are surfaced on manual refresh; mount sync is best-effort.
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync once when wallet is active
  }, [walletState.status, overview.isPending]);

  useEffect(() => {
    if (!hasPendingTx) return;

    const intervalId = window.setInterval(() => {
      void runFullRefresh({ silent: true }).catch(() => undefined);
    }, 10_000);

    return () => window.clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- poll while pending txs exist
  }, [hasPendingTx]);

  return (
    <>
      <PageHeader
        title="Wallet"
        description="Manage your WFL Wallet, connected wallets, assets, and transactions."
        action={
          <button
            type="button"
            onClick={() => void runFullRefresh()}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-content-primary shadow-sm hover:bg-muted disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        }
      />

      {overview.isPending && !overview.data ? (
        <LoadingState label="Loading wallet…" />
      ) : overview.isError ? (
        <ErrorState
          error={overview.error}
          title="Wallet data could not be loaded"
          onRetry={() => void overview.refetch()}
        />
      ) : (
        <div className="space-y-6">
          <WflWalletStatusBanner overview={overview.data} />
          <WalletBalanceCard
            overview={overview.data}
            assets={assets.data?.assets}
            lastSyncedAt={lastSyncedAt}
          />
          <ConnectedWalletsSection overview={overview.data} />
          <WalletTransactionsChartSection />
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <AssetsSection
                assets={assets.data?.assets}
                isLoading={assets.isPending}
                lastSyncedAt={lastSyncedAt}
              />
            </div>
            <div className="lg:col-span-5">
              <RecentTransactionsSection />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
