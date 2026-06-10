"use client";

import { ActivityFeedItem } from "@/components/activity/activity-feed-item";
import type { WalletControlCenterActivityItem } from "@/lib/api/types";

type Props = {
  items: WalletControlCenterActivityItem[];
};

export function WalletControlCenterActivity({ items }: Props) {
  return (
    <section
      id="wallet-recent-activity"
      className="w-full min-w-0 max-w-full rounded-2xl border border-border bg-card p-6 shadow-soft"
    >
      <h2 className="text-lg font-semibold text-content-primary">Recent activity</h2>
      {items.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <ActivityFeedItem
                action={item.action}
                chain={item.chain}
                created_at={item.created_at}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-content-muted">No wallet activity yet.</p>
      )}
    </section>
  );
}
