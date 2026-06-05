"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/components/system/toast-context";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import { AGENT_DISCLAIMER } from "@/lib/config/agent-features";
import {
  buildAgentCreateBody,
  CreateAgentForm,
  type CreateAgentFormValues,
} from "@/features/agent/components/create-agent-form";
import { useCreateAgentMutation } from "@/features/agent/use-agents";
import { useState } from "react";

export default function AgentCreatePage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const createMut = useCreateAgentMutation();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(values: CreateAgentFormValues) {
    setError(null);
    try {
      const agent = await createMut.mutateAsync(buildAgentCreateBody(values));
      pushToast({ tone: "success", title: "Agent created successfully." });
      router.push(`/agent/${agent.id}`);
    } catch (e) {
      setError(normalizeApiError(e));
    }
  }

  return (
    <>
      <PageHeader
        title="Create Agent"
        description="Configure a research or trade-suggestion agent."
        action={
          <Link href="/agent" className="text-sm text-primary underline">
            Back to agents
          </Link>
        }
      />
      <p className="mb-4 text-xs text-muted-foreground">{AGENT_DISCLAIMER}</p>
      <CreateAgentForm onSubmit={handleSubmit} pending={createMut.isPending} error={error} />
    </>
  );
}
