"use client";

import type { RewardsOverview } from "@/types/rewards";

type RewardsSummaryCardsProps = {
  summary: RewardsOverview["summary"];
};

export function RewardsSummaryCards({ summary }: RewardsSummaryCardsProps) {
  const currency = summary.currency;

  const cards = [
    { label: "Total invited", value: String(summary.total_invited) },
    { label: "Active members", value: String(summary.active_members) },
    {
      label: "Estimated monthly rewards",
      value: `${summary.estimated_monthly_rewards} ${currency}`,
    },
    { label: "Pending", value: `${summary.pending_rewards} ${currency}` },
    { label: "Paid", value: `${summary.paid_rewards} ${currency}` },
  ];

  return (
    <section
      aria-label="Rewards summary"
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
    >
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-xl border border-surface-border bg-surface-raised p-4"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-content-muted">
            {card.label}
          </p>
          <p className="mt-1 text-lg font-semibold text-content-primary">{card.value}</p>
        </article>
      ))}
    </section>
  );
}
