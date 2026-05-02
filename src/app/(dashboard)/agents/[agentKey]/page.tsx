"use client";

import { useParams } from "next/navigation";
import { AgentsDisclaimerBanner } from "@/components/agents/disclaimer";
import { AgentRunForm } from "@/components/agents/agent-run-form";
import { PageHeader } from "@/components/page-header";
import { InlineAlert } from "@/components/system/inline-alert";
import { useAgentsCatalogQuery } from "@/features/agents/use-agents-api";
import { AGENT_KEYS, type AgentKey } from "@/types/agents";

function isAgentKey(k: string): k is AgentKey {
  return (AGENT_KEYS as readonly string[]).includes(k);
}

export default function AgentDetailPage() {
  const params = useParams<{ agentKey: string }>();
  const key = typeof params?.agentKey === "string" ? params.agentKey : "";
  const catalog = useAgentsCatalogQuery();

  const meta = catalog.data?.agents.find((a) => a.key === key);
  const valid = isAgentKey(key);

  const defaultSymbols = key === "forex_research" ? "EURUSD" : "BTC";

  if (!valid) {
    return (
      <>
        <PageHeader title="Unknown agent" description="Pick an agent from the catalog." />
        <InlineAlert tone="error">This agent key is not recognized.</InlineAlert>
      </>
    );
  }

  return (
    <>
      <PageHeader title={meta?.name ?? key} description={meta?.description ?? ""} />
      <AgentsDisclaimerBanner />
      <AgentRunForm agentKey={key} defaultSymbols={defaultSymbols} showCountryField={key === "country_stock"} />
    </>
  );
}
