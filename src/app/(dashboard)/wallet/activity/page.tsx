"use client";

import { ActivityFeedItem } from "@/components/activity/activity-feed-item";
import { PageHeader } from "@/components/page-header";
import { useAppWalletActivityQuery } from "@/features/wallets/use-wallet-mutations";
import { LoadingState } from "@/components/system/loading-state";
import { ErrorState } from "@/components/system/error-state";

export default function WalletActivityPage() {
  const activity = useAppWalletActivityQuery();

  if (activity.isPending) return <LoadingState />;
  if (activity.isError) return <ErrorState error={activity.error} onRetry={() => void activity.refetch()} />;

  const items = activity.data ?? [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Wallet Activity"
        description="Recent updates and transactions for your wallets."
      />
      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={(item.id as string | number | undefined) ?? index}>
              <ActivityFeedItem
                action={item.action as string | undefined}
                chain={item.chain as string | null | undefined}
                created_at={item.created_at as string | undefined}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No activity yet.</p>
      )}
    </div>
  );
}
