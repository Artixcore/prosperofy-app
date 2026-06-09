"use client";

import { useAppWalletOverviewQuery } from "@/features/wallets/use-wallet-mutations";
import { wflWalletState, primaryWalletAddress } from "@/features/wallets/wallet-derive";
import { LoadingState } from "@/components/system/loading-state";
import { ErrorState } from "@/components/system/error-state";
import { formatChainName, shortenAddress } from "@/lib/formatters";

export default function WalletSettingsPage() {
  const overview = useAppWalletOverviewQuery();

  if (overview.isPending) return <LoadingState />;
  if (overview.isError) return <ErrorState error={overview.error} onRetry={() => void overview.refetch()} />;

  const state = wflWalletState(overview.data);
  const primary = primaryWalletAddress(overview.data);

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold text-foreground">Wallet Settings</h1>
      <p className="text-sm text-muted-foreground">
        Your Prosperofy WFL Wallet is managed securely on our servers.
      </p>
      <div className="rounded border border-surface-border px-4 py-3 text-sm">
        <p className="font-medium text-foreground">WFL Wallet</p>
        <p className="mt-1 text-muted-foreground">Status: {state.status}</p>
        {primary ? (
          <p className="mt-2 font-mono text-xs text-foreground">
            {formatChainName(primary.network)}: {shortenAddress(primary.address, 8)}
          </p>
        ) : (
          <p className="mt-2 text-muted-foreground">No public address available yet.</p>
        )}
      </div>
    </div>
  );
}
