"use client";

import Link from "next/link";
import { AgentsDisclaimerBanner } from "@/components/agents/disclaimer";
import { SignalRow } from "@/components/agents/signal-row";
import { PageHeader } from "@/components/page-header";
import { InlineAlert } from "@/components/system/inline-alert";
import { EmptyState } from "@/components/empty-state";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import { useSignalsQuery } from "@/features/agents/use-agents-api";

export default function AgentsSignalsPage() {
  const q = useSignalsQuery(1);
  const err = q.isError ? normalizeApiError(q.error) : null;
  const rows = q.data?.signals.data ?? [];

  return (
    <>
      <PageHeader
        title="AI signals"
        description="AI-generated signals include risk scores and disclaimers. None of this is a promise of profit."
      />
      <div className="space-y-4">
        <AgentsDisclaimerBanner />
        {err ? <InlineAlert tone="error">{err}</InlineAlert> : null}
        <div className="flex gap-4 text-sm">
          <Link href="/agents/signals/generate" className="font-medium text-primary hover:underline">
            Generate new signal
          </Link>
          <Link href="/agents" className="text-muted-foreground hover:text-foreground">
            Back to agents
          </Link>
        </div>
        {q.isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
        {!q.isLoading && !rows.length ? (
          <EmptyState title="No signals" description="Generate a signal from the dedicated flow or via the Signal agent." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-full border-collapse">
              <thead className="bg-muted/60 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2 pl-3 pr-4">Symbol</th>
                  <th className="py-2 pr-4">Market</th>
                  <th className="py-2 pr-4">Dir</th>
                  <th className="py-2 pr-4">Conf</th>
                  <th className="py-2 pr-4">Risk</th>
                  <th className="py-2 pr-4">TF</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-3 text-right"> </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <SignalRow key={s.id} signal={s} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
