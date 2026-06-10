"use client";

import type { YieldAllocation } from "@/lib/api/types";

type Props = {
  items: YieldAllocation[];
};

function formatStatus(status: string): string {
  return status.replace(/_/g, " ");
}

export function YieldAllocationsList({ items }: Props) {
  if (items.length === 0) {
    return <p className="text-sm text-content-muted">No yield allocations yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-4 py-3"
        >
          <div>
            <p className="text-sm font-medium text-content-primary">
              {item.pool_name ?? "Yield pool"} · {item.amount} {item.currency}
            </p>
            <p className="text-xs capitalize text-content-muted">{formatStatus(item.status)}</p>
          </div>
          {item.auto_compound_enabled ? (
            <span className="rounded-full bg-muted px-2 py-1 text-xs text-content-muted">
              Auto-compound on
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
