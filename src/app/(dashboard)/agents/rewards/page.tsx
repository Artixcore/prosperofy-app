"use client";

import Link from "next/link";
import { AgentsDisclaimerBanner } from "@/components/agents/disclaimer";
import { PageHeader } from "@/components/page-header";
import { InlineAlert } from "@/components/system/inline-alert";
import { EmptyState } from "@/components/empty-state";
import { SubmitButton } from "@/components/system/submit-button";
import { RewardStatusBadge } from "@/components/agents/reward-status-badge";
import { isApiClientError } from "@/lib/api/errors";
import { useClaimRewardMutation, useRewardsQuery } from "@/features/agents/use-agents-api";

export default function AgentsRewardsPage() {
  const q = useRewardsQuery(1);
  const claim = useClaimRewardMutation();
  const err =
    q.isError && isApiClientError(q.error)
      ? q.error.message
      : q.isError
        ? "Rewards could not be loaded. Please try again shortly."
        : null;
  const rows = q.data?.rewards.data ?? [];

  return (
    <>
      <PageHeader
        title="WFL rewards"
        description="Rewards require verified outcomes server-side. Anti-abuse caps apply; amounts are never set by the browser."
      />
      <div className="space-y-4">
        <AgentsDisclaimerBanner />
        <div className="rounded-md border border-zinc-700 bg-zinc-900/40 p-3 text-xs text-zinc-400">
          Claims execute via configured payout drivers. Simulated payouts record a reference hash only — not on-chain
          transfers unless Solana SPL is configured server-side.
        </div>
        {err ? <InlineAlert tone="error">{err}</InlineAlert> : null}
        <Link href="/agents" className="text-sm text-sky-400 hover:text-sky-300">
          ← Agents overview
        </Link>
        {q.isLoading ? <p className="text-sm text-zinc-500">Loading…</p> : null}
        {!q.isLoading && !rows.length ? (
          <EmptyState title="No rewards" description="Verified gains may create reward events pending staff review." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-surface-border">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-surface-raised/40 text-left text-xs uppercase text-zinc-500">
                <tr>
                  <th className="py-2 pl-3 pr-4">Type</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">WFL</th>
                  <th className="py-2 pr-4">Gain</th>
                  <th className="py-2 pr-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-surface-border">
                    <td className="py-2 pl-3 pr-4">{r.reward_type}</td>
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
                            void claim.mutateAsync(r.id);
                          }}
                        >
                          <SubmitButton pending={claim.isPending}>Claim</SubmitButton>
                        </form>
                      ) : (
                        <span className="text-xs text-zinc-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
