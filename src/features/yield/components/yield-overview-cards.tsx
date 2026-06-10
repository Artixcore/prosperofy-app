"use client";

import type { YieldOverview } from "@/lib/api/types";

type Props = {
  overview: YieldOverview;
};

function SummaryCard({ label, value, currency }: { label: string; value: string; currency: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
      <p className="text-xs font-medium uppercase tracking-wide text-content-muted">{label}</p>
      <p className="mt-2 text-lg font-semibold text-content-primary">
        {value} {currency}
      </p>
    </div>
  );
}

export function YieldOverviewCards({ overview }: Props) {
  const { summary } = overview;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <SummaryCard
        label="Total allocated"
        value={summary.total_allocated}
        currency={summary.currency}
      />
      <SummaryCard
        label="Confirmed earnings"
        value={summary.confirmed_earnings}
        currency={summary.currency}
      />
      <SummaryCard
        label="Estimated earnings"
        value={summary.estimated_earnings}
        currency={summary.currency}
      />
    </div>
  );
}
