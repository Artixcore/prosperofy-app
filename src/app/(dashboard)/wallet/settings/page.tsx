"use client";

import { useAppWalletOverviewQuery } from "@/features/wallets/use-wallet-mutations";
import { LoadingState } from "@/components/system/loading-state";
import { ErrorState } from "@/components/system/error-state";

export default function WalletSettingsPage() {
  const overview = useAppWalletOverviewQuery();

  if (overview.isPending) return <LoadingState />;
  if (overview.isError) return <ErrorState error={overview.error} onRetry={() => void overview.refetch()} />;

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold text-foreground">Wallet Settings</h1>
      <p className="text-sm text-muted-foreground">Manage connected wallet security status and linkage.</p>
      <ul className="space-y-2">
        {overview.data?.connected_wallets.map((wallet) => (
          <li key={wallet.id} className="rounded border border-surface-border px-3 py-2 text-sm">
            {wallet.provider} ({wallet.chain_type}) - {wallet.address}
          </li>
        ))}
      </ul>
    </div>
  );
}
