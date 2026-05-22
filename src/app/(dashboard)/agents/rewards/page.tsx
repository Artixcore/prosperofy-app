"use client";

import { useState } from "react";
import Link from "next/link";
import { AgentsDisclaimerBanner } from "@/components/agents/disclaimer";
import { PageHeader } from "@/components/page-header";
import { InlineAlert } from "@/components/system/inline-alert";
import { EmptyState } from "@/components/empty-state";
import { ListPagination } from "@/components/system/list-pagination";
import { SubmitButton } from "@/components/system/submit-button";
import { RewardStatusBadge } from "@/components/agents/reward-status-badge";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import { useClaimRewardMutation, useRewardsQuery } from "@/features/agents/use-agents-api";

export default function AgentsRewardsPage() {
  const [page, setPage] = useState(1);
  const [claimErr, setClaimErr] = useState<string | null>(null);
  const q = useRewardsQuery(page);
  const claim = useClaimRewardMutation();
  const err = q.isError ? normalizeApiError(q.error) : null;
  const paginator = q.data?.rewards;
  const rows = paginator?.data ?? [];

  return (
    <>
      <PageHeader
        title="WFL rewards"
        description="Rewards require verified outcomes server-side. Anti-abuse caps apply; amounts are never set by the browser."
      />
      <div className="space-y-4">
        <AgentsDisclaimerBanner />
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-900/45 dark:bg-amber-950/30 dark:text-amber-100">
          Claims execute via configured payout drivers. Simulated payouts record a reference hash only — not on-chain
          transfers unless Solana SPL is configured server-side.
        </div>
        {err ? <InlineAlert tone="error">{err}</InlineAlert> : null}
        {claimErr ? <InlineAlert tone="error">{claimErr}</InlineAlert> : null}
        <Link href="/agents" className="text-sm font-medium text-primary hover:underline">
          ← Agents overview
        </Link>
        {q.isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
        {!q.isLoading && !rows.length ? (
          <EmptyState title="No rewards" description="Verified gains may create reward events pending staff review." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2 pl-3 pr-4">Type</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">WFL</th>
                  <th className="py-2 pr-4">Gain</th>
                  <th className="py-2 pr-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border">
                    <td className="py-2 pl-3 pr-4 text-foreground">{r.reward_type}</td>
                    <td className="py-2 pr-4">
                      <RewardStatusBadge status={r.status} />
                    </td>
                    <td className="py-2 pr-4">{r.wfl_amount}</td>
                    <td className="py-2 pr-4">{r.gain_amount ?? "—"}</td>
                    <td className="py-2 pr-3 text-right">
                      {r.status === "claimable" ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            setClaimErr(null);
                            void claim
                              .mutateAsync(r.id)
                              .catch((error: unknown) => setClaimErr(normalizeApiError(error)));
                          }}
                        >
                          <SubmitButton pending={claim.isPending}>Claim</SubmitButton>
                        </form>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {paginator ? (
          <ListPagination page={page} lastPage={paginator.last_page} onPageChange={setPage} />
        ) : null}
      </div>
    </>
  );
}
