"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ErrorState } from "@/components/system/error-state";
import { LoadingState } from "@/components/system/loading-state";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/components/system/toast-context";
import { MasterWalletSummaryCard } from "@/features/wallets/components/master-wallet-summary-card";
import { SubWalletCard } from "@/features/wallets/components/sub-wallet-card";
import { SubWalletDetailPanel } from "@/features/wallets/components/sub-wallet-detail-panel";
import { WalletControlCenterActivity } from "@/features/wallets/components/wallet-control-center-activity";
import { WflWalletStatusBanner } from "@/features/wallets/components/wfl-wallet-status-banner";
import {
  useAppWalletOverviewQuery,
  useRefreshWalletBalancesMutation,
  useWalletControlCenterQuery,
} from "@/features/wallets/use-wallet-mutations";
import { handleSubWalletAction } from "@/features/wallets/wallet-action-handler";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import type { SubWalletType } from "@/lib/api/types";

export default function WalletPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const controlCenter = useWalletControlCenterQuery();
  const overview = useAppWalletOverviewQuery();
  const refreshBalances = useRefreshWalletBalancesMutation();
  const [selectedType, setSelectedType] = useState<SubWalletType>("save");

  const refreshing = refreshBalances.isPending || controlCenter.isFetching;

  const selectedWallet = useMemo(() => {
    const wallets = controlCenter.data?.sub_wallets ?? [];
    return wallets.find((wallet) => wallet.type === selectedType) ?? wallets[0] ?? null;
  }, [controlCenter.data?.sub_wallets, selectedType]);

  const handleAction = (actionKey: string) => {
    const wallet = controlCenter.data?.sub_wallets.find((item) =>
      item.actions.some((action) => action.key === actionKey),
    );
    const action = wallet?.actions.find((item) => item.key === actionKey);
    if (!action) return;
    handleSubWalletAction(action, router, pushToast);
  };

  const runRefresh = async () => {
    try {
      await refreshBalances.mutateAsync({ force: true });
      pushToast({
        tone: "success",
        title: "Balances updated.",
      });
    } catch (error) {
      pushToast({
        tone: "error",
        title: "We couldn't refresh balances right now.",
        description:
          normalizeApiError(error, "wallet-refresh") ||
          "Please try again in a moment.",
      });
    }
  };

  return (
    <>
      <PageHeader
        title="Wallet Control Center"
        description="Manage your Save, Invest, and Spend wallets from one place."
        action={
          <button
            type="button"
            onClick={() => void runRefresh()}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-content-primary shadow-sm hover:bg-muted disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden />
            {refreshing ? "Refreshing…" : "Refresh balances"}
          </button>
        }
      />

      {controlCenter.isPending && !controlCenter.data ? (
        <LoadingState label="Loading your wallet control center..." />
      ) : controlCenter.isError ? (
        <ErrorState
          error={controlCenter.error}
          title="We couldn't load your wallet details right now."
          onRetry={() => void controlCenter.refetch()}
        />
      ) : controlCenter.data ? (
        <div className="w-full min-w-0 max-w-full space-y-6">
          <WflWalletStatusBanner overview={overview.data} />
          <MasterWalletSummaryCard master={controlCenter.data.master_wallet} />

          <div className="grid w-full min-w-0 max-w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {controlCenter.data.sub_wallets.map((wallet) => (
              <SubWalletCard
                key={wallet.type}
                wallet={wallet}
                selected={selectedType === wallet.type}
                onSelect={() => setSelectedType(wallet.type)}
                onAction={handleAction}
              />
            ))}
          </div>

          <SubWalletDetailPanel wallet={selectedWallet} onAction={handleAction} />
          <WalletControlCenterActivity items={controlCenter.data.recent_activity} />
        </div>
      ) : null}
    </>
  );
}
