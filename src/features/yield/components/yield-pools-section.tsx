"use client";

import { useState } from "react";
import { ErrorState } from "@/components/system/error-state";
import { InlineAlert } from "@/components/system/inline-alert";
import { LoadingState } from "@/components/system/loading-state";
import { YieldAllocationModal } from "@/features/yield/components/yield-allocation-modal";
import { YieldAllocationsList } from "@/features/yield/components/yield-allocations-list";
import { YieldEarningsList } from "@/features/yield/components/yield-earnings-list";
import { YieldMembershipGate } from "@/features/yield/components/yield-membership-gate";
import { YieldOverviewCards } from "@/features/yield/components/yield-overview-cards";
import { YieldPoolCard } from "@/features/yield/components/yield-pool-card";
import {
  useYieldAllocationsQuery,
  useYieldEarningsQuery,
  useYieldOverviewQuery,
  useYieldPoolsQuery,
} from "@/features/yield/use-yield";
import { isApiClientError } from "@/lib/api/errors";
import type { YieldPool } from "@/lib/api/types";

export function YieldPoolsSection() {
  const overview = useYieldOverviewQuery();
  const pools = useYieldPoolsQuery();
  const allocations = useYieldAllocationsQuery();
  const earnings = useYieldEarningsQuery();
  const [selectedPool, setSelectedPool] = useState<YieldPool | null>(null);
  const [detailPool, setDetailPool] = useState<YieldPool | null>(null);

  const isLoading =
    (overview.isPending && !overview.data) ||
    (pools.isPending && !pools.data) ||
    (allocations.isPending && !allocations.data) ||
    (earnings.isPending && !earnings.data);

  if (isLoading) {
    return <LoadingState label="Loading yield pools…" />;
  }

  if (overview.isError) {
    if (isApiClientError(overview.error) && overview.error.code === "YIELD_FEATURE_DISABLED") {
      return null;
    }

    return (
      <ErrorState
        error={overview.error}
        title="We couldn't load yield pools right now."
        onRetry={() => void overview.refetch()}
      />
    );
  }

  const overviewData = overview.data;
  if (!overviewData?.enabled) {
    return null;
  }

  const poolItems = pools.data?.items ?? [];
  const allocationItems = allocations.data?.items ?? [];
  const earningItems = earnings.data?.items ?? [];

  return (
    <section
      id="yield-pools"
      className="w-full min-w-0 max-w-full rounded-2xl border border-border bg-card p-6 shadow-soft"
    >
      <h2 className="text-lg font-semibold text-content-primary">Yield Pools</h2>
      <p className="mt-1 text-sm text-content-muted">
        Allocate part of your Save Wallet into eligible long-term yield opportunities.
      </p>

      <div className="mt-4">
        <InlineAlert tone="warning">
          Yield pools involve smart contract, liquidity, and market risk. Returns are not
          guaranteed.
        </InlineAlert>
      </div>

      {!overviewData.provider_enabled ? (
        <div className="mt-4">
          <InlineAlert tone="info">
            Yield allocations are not available yet. You can review the feature, but deposits are
            disabled until the provider is live.
          </InlineAlert>
        </div>
      ) : null}

      {overviewData.membership.required && !overviewData.membership.eligible ? (
        <div className="mt-4">
          <YieldMembershipGate />
        </div>
      ) : (
        <>
          <div className="mt-6">
            <YieldOverviewCards overview={overviewData} />
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-content-primary">Available pools</h3>
            {poolItems.length > 0 ? (
              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                {poolItems.map((pool) => (
                  <YieldPoolCard
                    key={pool.id}
                    pool={pool}
                    onViewDetails={() => setDetailPool(pool)}
                    onAllocate={() => setSelectedPool(pool)}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-content-muted">No active yield pools are listed yet.</p>
            )}
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-content-primary">My allocations</h3>
            <div className="mt-3">
              <YieldAllocationsList items={allocationItems} />
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-content-primary">Earnings history</h3>
            <div className="mt-3">
              <YieldEarningsList items={earningItems} />
            </div>
          </div>
        </>
      )}

      {detailPool ? (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-content-primary">{detailPool.name}</h3>
            {detailPool.description ? (
              <p className="mt-2 text-sm text-content-muted">{detailPool.description}</p>
            ) : null}
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-content-muted">Asset</dt>
                <dd className="font-medium text-content-primary">{detailPool.asset_symbol}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-content-muted">Network</dt>
                <dd className="font-medium text-content-primary">{detailPool.network}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-content-muted">APY</dt>
                <dd className="font-medium text-content-primary">
                  {detailPool.apy_display ?? "APY data unavailable"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-content-muted">Risk level</dt>
                <dd className="font-medium capitalize text-content-primary">{detailPool.risk_level}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => setDetailPool(null)}
              className="mt-6 rounded-md border border-border px-4 py-2 text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      {selectedPool ? (
        <YieldAllocationModal
          pool={selectedPool}
          overview={overviewData}
          onClose={() => setSelectedPool(null)}
        />
      ) : null}
    </section>
  );
}
