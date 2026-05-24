"use client";

import { RefreshCw } from "lucide-react";
import { ErrorState } from "@/components/system/error-state";
import { LoadingState } from "@/components/system/loading-state";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/components/system/toast-context";
import { AssetsSection } from "@/features/wallets/components/assets-section";
import { ConnectedWalletsSection } from "@/features/wallets/components/connected-wallets-section";
import { RecentTransactionsSection } from "@/features/wallets/components/recent-transactions-section";
import { WalletBalanceCard } from "@/features/wallets/components/wallet-balance-card";
import { WflWalletStatusBanner } from "@/features/wallets/components/wfl-wallet-status-banner";
import {
  useAppWalletAssetsQuery,
  useAppWalletOverviewQuery,
  useRefreshWalletAssetsMutation,
} from "@/features/wallets/use-wallet-mutations";
import { normalizeApiError } from "@/lib/api/normalize-api-error";

export default function WalletPage() {
  const overview = useAppWalletOverviewQuery();
  const assets = useAppWalletAssetsQuery();
  const refreshMu = useRefreshWalletAssetsMutation();
  const { pushToast } = useToast();

  const refreshing = refreshMu.isPending || overview.isFetching || assets.isFetching;

  // Prefer the freshest of the three sources of `last_synced_at` we have:
  // the just-completed refresh response, the cached assets list, or the
  // overview snapshot. None of these contain user secrets — only timestamps.
  const lastSyncedAt =
    refreshMu.data?.last_synced_at ??
    assets.data?.last_synced_at ??
    overview.data?.last_synced_at ??
    null;

  const handleRefresh = async () => {
    try {
      const result = await refreshMu.mutateAsync({ force: true });
      pushToast({
        tone: "success",
        title: result.from_cache ? "Already up to date" : "Balances refreshed",
        description: result.from_cache
          ? "Your wallet balances were synced very recently."
          : "Latest on-chain balances are loaded.",
      });
    } catch (error) {
      pushToast({
        tone: "error",
        title: "Could not refresh balance",
        description:
          normalizeApiError(error, "wallet-refresh") ||
          "Balance refresh failed. Please try again shortly.",
      });
    }
  };

  return (
    <>
      <PageHeader
        title="Wallet"
        description="Manage your WFL Wallet, connected wallets, assets, and transactions."
        action={
          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-content-primary shadow-sm hover:bg-muted disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden />
            {refreshing ? "Refreshing…" : "Refresh Balance"}
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
          <WalletBalanceCard overview={overview.data} assets={assets.data?.assets} />
          <ConnectedWalletsSection overview={overview.data} />
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
