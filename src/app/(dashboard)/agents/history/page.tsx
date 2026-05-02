"use client";

import Link from "next/link";
import { AgentsDisclaimerBanner } from "@/components/agents/disclaimer";
import { PageHeader } from "@/components/page-header";
import { InlineAlert } from "@/components/system/inline-alert";
import { EmptyState } from "@/components/empty-state";
import { isApiClientError } from "@/lib/api/errors";
import { useAgentRunsQuery } from "@/features/agents/use-agents-api";
import type { AiAgentRunRow } from "@/types/agents";

export default function AgentsHistoryPage() {
  const q = useAgentRunsQuery(1);
  const err =
    q.isError && isApiClientError(q.error)
      ? q.error.message
      : q.isError
        ? "History could not be loaded. Please try again shortly."
        : null;
  const runs = q.data?.runs.data ?? [];

  return (
    <>
      <PageHeader title="Agent run history" description="Audit trail of analyses executed for your account." />
      <div className="space-y-4">
        <AgentsDisclaimerBanner />
        {err ? <InlineAlert tone="error">{err}</InlineAlert> : null}
        <Link href="/agents" className="text-sm text-sky-400 hover:text-sky-300">
          ← Agents overview
        </Link>
        {q.isLoading ? <p className="text-sm text-zinc-500">Loading…</p> : null}
        {!q.isLoading && !runs.length ? (
          <EmptyState title="No runs yet" description="Run an agent from the catalog to see history here." />
        ) : (
          <ul className="space-y-2">
            {runs.map((r: AiAgentRunRow) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-surface-border bg-surface-raised/20 px-3 py-2 text-sm text-zinc-300"
              >
                <span className="font-medium text-white">{r.agent_key}</span>
                <span className="text-xs text-zinc-500">{r.status}</span>
                <span className="text-xs text-zinc-600">{r.created_at}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
