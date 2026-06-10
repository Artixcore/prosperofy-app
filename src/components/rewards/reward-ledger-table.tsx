"use client";

import type { RewardLedgerItem } from "@/types/rewards";

type RewardLedgerTableProps = {
  items: RewardLedgerItem[];
  currency: string;
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function formatType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function RewardLedgerTable({ items, currency }: RewardLedgerTableProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-surface-border bg-surface-raised p-5">
      <h2 className="text-sm font-semibold text-content-primary">Recurring rewards</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-surface-border text-content-muted">
              <th className="px-2 py-2 font-medium">Date</th>
              <th className="px-2 py-2 font-medium">Source</th>
              <th className="px-2 py-2 font-medium">Type</th>
              <th className="px-2 py-2 font-medium">Amount</th>
              <th className="px-2 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={`${item.date ?? "row"}-${item.source_label}-${index}`}
                className="border-b border-surface-border/60"
              >
                <td className="px-2 py-2 text-content-primary">{formatDate(item.date)}</td>
                <td className="px-2 py-2 text-content-primary">{item.source_label}</td>
                <td className="px-2 py-2 text-content-primary">{formatType(item.type)}</td>
                <td className="px-2 py-2 text-content-primary">
                  {item.amount} {item.currency || currency}
                </td>
                <td className="px-2 py-2 text-content-primary">{formatStatus(item.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
