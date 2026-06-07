"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/system/loading-state";
import { ErrorState } from "@/components/system/error-state";
import { useToast } from "@/components/system/toast-context";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import type { UserAgentRecord } from "@/lib/api/types";
import { AGENT_DISCLAIMER } from "@/lib/config/agent-features";
import { AgentCard } from "@/features/agent/components/agent-card";
import {
  useAgentsQuery,
  useDeleteAgentMutation,
  useDisableAgentMutation,
  useRunAgentMutation,
} from "@/features/agent/use-agents";

function AgentListItem({
  agent,
  onRefresh,
}: {
  agent: UserAgentRecord;
  onRefresh: () => void;
}) {
  const { pushToast } = useToast();
  const runMut = useRunAgentMutation(agent.id);
  const disableMut = useDisableAgentMutation();
  const deleteMut = useDeleteAgentMutation();

  return (
    <AgentCard
      agent={agent}
      runPending={runMut.isPending}
      onRun={async () => {
        try {
          await runMut.mutateAsync("analysis");
          pushToast({ tone: "success", title: "Analysis run completed" });
          onRefresh();
        } catch (e) {
          pushToast({
            tone: "error",
            title: "Run failed",
            description: normalizeApiError(e),
          });
        }
      }}
      onDisable={async () => {
        try {
          await disableMut.mutateAsync(agent.id);
          pushToast({ tone: "success", title: "Agent disabled" });
          onRefresh();
        } catch (e) {
          pushToast({ tone: "error", title: normalizeApiError(e) });
        }
      }}
      onDelete={async () => {
        if (!confirm("Delete this agent?")) return;
        try {
          await deleteMut.mutateAsync(agent.id);
          pushToast({ tone: "success", title: "Agent deleted" });
          onRefresh();
        } catch (e) {
          pushToast({ tone: "error", title: normalizeApiError(e) });
        }
      }}
    />
  );
}

export default function AgentPage() {
  const agents = useAgentsQuery({ perPage: 20 });

  if (agents.isPending) return <LoadingState label="Loading agents…" />;
  if (agents.isError) {
    return (
      <ErrorState
        title="Agents could not be loaded. Please try again."
        error={agents.error}
        retryDisabled={agents.isFetching}
        onRetry={() => {
          if (!agents.isFetching) void agents.refetch();
        }}
      />
    );
  }

  const items = agents.data?.items ?? [];

  return (
    <>
      <PageHeader
        title="Agent"
        description="Create trading and research agents to analyze markets and review trade setups."
        action={
          <Link
            href="/agent/create"
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Create new Agent
          </Link>
        }
      />

      <p className="mb-4 text-xs text-muted-foreground">{AGENT_DISCLAIMER}</p>

      <div className="mb-4">
        <button
          type="button"
          onClick={() => agents.refetch()}
          className="text-sm text-primary underline"
        >
          Refresh
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-surface-border p-8 text-center text-muted-foreground">
          No agents yet. Create your first agent to start researching markets.
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((agent) => (
            <AgentListItem
              key={agent.id}
              agent={agent}
              onRefresh={() => void agents.refetch()}
            />
          ))}
        </div>
      )}
    </>
  );
}
