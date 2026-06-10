"use client";

import type { YieldEarning } from "@/lib/api/types";

type Props = {
  items: YieldEarning[];
};

export function YieldEarningsList({ items }: Props) {
  if (items.length === 0) {
    return <p className="text-sm text-content-muted">No yield earnings recorded yet.</p>;
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
            <p className="text-xs capitalize text-content-muted">{item.status}</p>
          </div>
          {item.earned_at ? (
            <time className="text-xs text-content-muted">
              {new Date(item.earned_at).toLocaleDateString()}
            </time>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
