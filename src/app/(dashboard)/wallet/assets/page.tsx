"use client";

import { useAppWalletAssetsQuery } from "@/features/wallets/use-wallet-mutations";
import { LoadingState } from "@/components/system/loading-state";
import { ErrorState } from "@/components/system/error-state";

export default function WalletAssetsPage() {
  const assets = useAppWalletAssetsQuery();

  if (assets.isPending) return <LoadingState />;
  if (assets.isError) return <ErrorState error={assets.error} onRetry={() => void assets.refetch()} />;

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold text-white">Wallet Assets</h1>
      {assets.data && assets.data.length > 0 ? (
        <ul className="space-y-2">
          {assets.data.map((asset) => (
            <li key={asset.id} className="rounded border border-surface-border px-3 py-2 text-sm">
              {asset.symbol} ({asset.chain}) - {asset.balance_cache ?? "0"}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-zinc-400">No assets yet. Balance providers can be connected later.</p>
      )}
    </div>
  );
}
