"use client";

import { usePayoutHistory } from "@/features/rewards/use-payout-profile";
import { LoadingState } from "@/components/system/loading-state";
import { EmptyState } from "@/components/empty-state";

export function PayoutHistoryTable() {
  const history = usePayoutHistory();
  const items = history.data?.items ?? [];

  if (history.isPending) {
    return <LoadingState label="Loading payout history…" />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="No payouts yet."
        description="When operators send a reward batch that includes your wallet, it will appear here."
      />
    );
  }

  return (
    <section className="rounded-xl border border-surface-border bg-surface-raised p-5">
      <h2 className="text-sm font-semibold text-content-primary">Payout history</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-surface-border text-content-muted">
              <th className="px-2 py-2 font-medium">Date</th>
              <th className="px-2 py-2 font-medium">Amount</th>
              <th className="px-2 py-2 font-medium">Wallet</th>
              <th className="px-2 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-surface-border/60">
                <td className="px-2 py-2 text-content-primary">
                  {item.created_at ? new Date(item.created_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-2 py-2 text-content-primary">
                  {item.amount} {item.currency.toUpperCase()}
                </td>
                <td className="px-2 py-2 font-mono text-content-primary">{item.wallet_address_masked}</td>
                <td className="px-2 py-2 capitalize text-content-primary">{item.status.replace(/_/g, " ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
