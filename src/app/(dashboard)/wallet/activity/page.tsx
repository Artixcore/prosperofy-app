"use client";

import { useAppWalletActivityQuery } from "@/features/wallets/use-wallet-mutations";
import { LoadingState } from "@/components/system/loading-state";
import { ErrorState } from "@/components/system/error-state";

export default function WalletActivityPage() {
  const activity = useAppWalletActivityQuery();

  if (activity.isPending) return <LoadingState />;
  if (activity.isError) return <ErrorState error={activity.error} onRetry={() => void activity.refetch()} />;

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold text-white">Wallet Activity</h1>
      {activity.data && activity.data.length > 0 ? (
        <ul className="space-y-2 text-sm">
          {activity.data.map((item, index) => (
            <li key={index} className="rounded border border-surface-border px-3 py-2">
              {(item.action as string) ?? "wallet.activity"} - {(item.chain as string) ?? "n/a"}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-zinc-400">No wallet activity yet.</p>
      )}
    </div>
  );
}
