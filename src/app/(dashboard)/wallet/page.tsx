"use client";

import { RefreshCw } from "lucide-react";
import { ErrorState } from "@/components/system/error-state";
import { LoadingState } from "@/components/system/loading-state";
import { PageHeader } from "@/components/page-header";
import { AssetsSection } from "@/features/wallets/components/assets-section";
import { ConnectedWalletsSection } from "@/features/wallets/components/connected-wallets-section";
import { RecentTransactionsSection } from "@/features/wallets/components/recent-transactions-section";
import { WalletBalanceCard } from "@/features/wallets/components/wallet-balance-card";
import { WflWalletStatusBanner } from "@/features/wallets/components/wfl-wallet-status-banner";
import {
  useAppWalletAssetsQuery,
  useAppWalletOverviewQuery,
} from "@/features/wallets/use-wallet-mutations";

export default function WalletPage() {
  const overview = useAppWalletOverviewQuery();
  const assets = useAppWalletAssetsQuery();

  const refreshing = overview.isFetching || assets.isFetching;
  const handleRefresh = () => {
    void overview.refetch();
    void assets.refetch();
  };

  return (
    <>
      <PageHeader
        title="Wallet"
        description="Manage your WFL Wallet, connected wallets, assets, and transactions."
        action={
          <button
            type="button"
            onClick={handleRefresh}
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
          <WalletBalanceCard overview={overview.data} />
          <ConnectedWalletsSection overview={overview.data} />
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <AssetsSection assets={assets.data} isLoading={assets.isPending} />
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
