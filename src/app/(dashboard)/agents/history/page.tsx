"use client";

import Link from "next/link";
import { AgentsDisclaimerBanner } from "@/components/agents/disclaimer";
import { PageHeader } from "@/components/page-header";
import { InlineAlert } from "@/components/system/inline-alert";
import { EmptyState } from "@/components/empty-state";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import { useAgentRunsQuery } from "@/features/agents/use-agents-api";
import type { AiAgentRunRow } from "@/types/agents";

export default function AgentsHistoryPage() {
  const q = useAgentRunsQuery(1);
  const err = q.isError ? normalizeApiError(q.error) : null;
  const runs = q.data?.runs.data ?? [];

  return (
    <>
      <PageHeader title="Agent run history" description="Audit trail of analyses executed for your account." />
      <div className="space-y-4">
        <AgentsDisclaimerBanner />
        {err ? <InlineAlert tone="error">{err}</InlineAlert> : null}
        <Link href="/agents" className="text-sm font-medium text-primary hover:underline">
          ← Agents overview
        </Link>
        {q.isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
        {!q.isLoading && !runs.length ? (
          <EmptyState title="No runs yet" description="Run an agent from the catalog to see history here." />
        ) : (
          <ul className="space-y-2">
            {runs.map((r: AiAgentRunRow) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground"
              >
                <span className="font-medium text-foreground">{r.agent_key}</span>
                <span className="text-xs">{r.status}</span>
                <span className="text-xs text-muted-foreground">{r.created_at}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
