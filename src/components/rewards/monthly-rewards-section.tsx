"use client";

import type { RewardMonthlySummaryItem } from "@/types/rewards";

type MonthlyRewardsSectionProps = {
  items: RewardMonthlySummaryItem[];
  currency: string;
};

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

export function MonthlyRewardsSection({ items, currency }: MonthlyRewardsSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-surface-border bg-surface-raised p-5">
      <h2 className="text-sm font-semibold text-content-primary">Monthly rewards</h2>
      <p className="mt-1 text-sm text-content-muted">Recurring membership rewards by month.</p>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-surface-border text-content-muted">
              <th className="px-2 py-2 font-medium">Month</th>
              <th className="px-2 py-2 font-medium">Estimated</th>
              <th className="px-2 py-2 font-medium">Approved</th>
              <th className="px-2 py-2 font-medium">Paid</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.month} className="border-b border-surface-border/60">
                <td className="px-2 py-2 text-content-primary">{formatMonth(row.month)}</td>
                <td className="px-2 py-2 text-content-primary">
                  {row.estimated} {currency}
                </td>
                <td className="px-2 py-2 text-content-primary">
                  {row.approved} {currency}
                </td>
                <td className="px-2 py-2 text-content-primary">
                  {row.paid} {currency}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
