"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/system/loading-state";
import { ErrorState } from "@/components/system/error-state";
import { useToast } from "@/components/system/toast-context";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import { AGENT_DISCLAIMER } from "@/lib/config/agent-features";
import {
  buildAgentUpdateBody,
  CreateAgentForm,
  type CreateAgentFormValues,
} from "@/features/agent/components/create-agent-form";
import { useAgentQuery, useUpdateAgentMutation } from "@/features/agent/use-agents";

export default function AgentEditPage() {
  const params = useParams<{ agentId: string }>();
  const agentId = params.agentId;
  const router = useRouter();
  const { pushToast } = useToast();
  const agent = useAgentQuery(agentId);
  const updateMut = useUpdateAgentMutation(agentId);
  const [error, setError] = useState<string | null>(null);

  if (agent.isPending) return <LoadingState label="Loading agent…" />;
  if (agent.isError || !agent.data) {
    return (
      <ErrorState
        title="Agent not found"
        error={agent.error}
        onRetry={() => agent.refetch()}
      />
    );
  }

  async function handleSubmit(values: CreateAgentFormValues) {
    setError(null);
    try {
      await updateMut.mutateAsync(buildAgentUpdateBody(values));
      pushToast({ tone: "success", title: "Agent updated successfully." });
      router.push(`/agent/${agentId}`);
    } catch (e) {
      setError(normalizeApiError(e, "agent"));
    }
  }

  return (
    <>
      <PageHeader
        title="Edit Agent"
        description={`Update settings for ${agent.data.name}.`}
        action={
          <Link href={`/agent/${agentId}`} className="text-sm text-primary underline">
            Back to agent
          </Link>
        }
      />
      <p className="mb-4 text-xs text-muted-foreground">{AGENT_DISCLAIMER}</p>
      <CreateAgentForm
        mode="edit"
        initialAgent={agent.data}
        onSubmit={handleSubmit}
        pending={updateMut.isPending}
        error={error}
        submitLabel="Update Agent"
      />
    </>
  );
}
