"use client";

import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { MonthlyRewardsSection } from "@/components/rewards/monthly-rewards-section";
import { ReferralLinkCard } from "@/components/rewards/referral-link-card";
import { ReferredMembersTable } from "@/components/rewards/referred-members-table";
import { PayoutHistoryTable } from "@/components/rewards/payout-history-table";
import { PayoutProfileForm } from "@/components/rewards/payout-profile-form";
import { RewardLedgerTable } from "@/components/rewards/reward-ledger-table";
import { RewardsSummaryCards } from "@/components/rewards/rewards-summary-cards";
import { ErrorState } from "@/components/system/error-state";
import { LoadingState } from "@/components/system/loading-state";
import {
  useRewardsLedger,
  useRewardsMonthlySummary,
  useRewardsOverview,
  useRewardsReferrals,
} from "@/features/rewards/use-rewards";

export function RewardsCenterPage() {
  const [referralsPage] = useState(1);
  const [ledgerPage] = useState(1);

  const overview = useRewardsOverview();
  const referrals = useRewardsReferrals(referralsPage);
  const ledger = useRewardsLedger(ledgerPage);
  const monthly = useRewardsMonthlySummary();

  const isLoading =
    overview.isPending ||
    referrals.isPending ||
    ledger.isPending ||
    monthly.isPending;

  if (isLoading && overview.fetchStatus === "fetching") {
    return <LoadingState label="Loading your rewards..." />;
  }

  if (overview.isError) {
    return (
      <ErrorState
        error={overview.error}
        onRetry={() => void overview.refetch()}
        title="We couldn't load your rewards right now."
      />
    );
  }

  const data = overview.data;
  if (!data) {
    return <LoadingState label="Loading your rewards..." />;
  }

  const referralMembers = referrals.data?.items ?? [];
  const ledgerItems = ledger.data?.items ?? [];
  const monthlyItems = monthly.data?.items ?? [];
  const hasReferrals = data.summary.total_invited > 0;

  return (
    <>
      <PageHeader
        title="Rewards Center"
        description="Invite members and track your recurring membership rewards."
      />

      <div className="space-y-6">
        <ReferralLinkCard code={data.referral.code} url={data.referral.url} />

        <RewardsSummaryCards summary={data.summary} />

        <article className="rounded-xl border border-surface-border bg-surface-raised p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-content-muted">
            Your plan reward rate
          </p>
          <p className="mt-1 text-lg font-semibold text-content-primary">
            {data.current_plan_reward_rate.label}
          </p>
          <p className="mt-1 text-sm text-content-muted">{data.current_plan_reward_rate.note}</p>
        </article>

        {!hasReferrals ? (
          <EmptyState
            title="No referrals yet."
            description="Share your link to start building recurring membership rewards."
          />
        ) : (
          <>
            <MonthlyRewardsSection items={monthlyItems} currency={data.summary.currency} />
            <ReferredMembersTable members={referralMembers} />
          </>
        )}

        <PayoutProfileForm />

        <PayoutHistoryTable />

        <RewardLedgerTable
          items={ledgerItems.length > 0 ? ledgerItems : data.recent_rewards}
          currency={data.summary.currency}
        />
      </div>
    </>
  );
}
