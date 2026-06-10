"use client";

import type { YieldPool } from "@/lib/api/types";

type Props = {
  pool: YieldPool;
  onViewDetails: () => void;
  onAllocate: () => void;
};

function formatLockup(days: number | null): string {
  if (days === null || days <= 0) return "No lockup";
  return `${days} day${days === 1 ? "" : "s"}`;
}

export function YieldPoolCard({ pool, onViewDetails, onAllocate }: Props) {
  const apyLabel = pool.apy_display ?? "APY data unavailable";

  return (
    <article className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-content-primary">{pool.name}</h3>
          <p className="mt-1 text-sm text-content-muted">
            {pool.asset_symbol} · {pool.network}
          </p>
        </div>
        <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium capitalize text-content-muted">
          {pool.status}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-content-muted">APY range</dt>
          <dd className="font-medium text-content-primary">{apyLabel}</dd>
        </div>
        <div>
          <dt className="text-content-muted">Risk</dt>
          <dd className="font-medium capitalize text-content-primary">{pool.risk_level}</dd>
        </div>
        <div>
          <dt className="text-content-muted">Lockup</dt>
          <dd className="font-medium text-content-primary">{formatLockup(pool.lockup_days)}</dd>
        </div>
        <div>
          <dt className="text-content-muted">Auto-compound</dt>
          <dd className="font-medium text-content-primary">
            {pool.auto_compound_supported ? "Supported" : "Not supported"}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onViewDetails}
          className="rounded-md border border-border px-3 py-2 text-sm font-medium text-content-primary hover:bg-muted"
        >
          View details
        </button>
        <button
          type="button"
          onClick={onAllocate}
          disabled={!pool.allocate_enabled}
          className={`rounded-md px-3 py-2 text-sm font-medium ${
            pool.allocate_enabled
              ? "bg-primary text-primary-foreground hover:brightness-110"
              : "cursor-not-allowed bg-muted text-content-muted"
          }`}
        >
          Allocate
        </button>
      </div>
      {!pool.allocate_enabled && pool.disabled_reason ? (
        <p className="mt-2 text-xs text-content-muted">{pool.disabled_reason}</p>
      ) : null}
    </article>
  );
}
