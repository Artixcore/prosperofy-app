"use client";

import Link from "next/link";
import { AgentCard } from "@/components/agents/agent-card";
import { SignalCard } from "@/components/agents/signal-card";
import { AgentsDisclaimerBanner } from "@/components/agents/disclaimer";
import { PageHeader } from "@/components/page-header";
import { InlineAlert } from "@/components/system/inline-alert";
import { EmptyState } from "@/components/empty-state";
import { isApiClientError } from "@/lib/api/errors";
import { useAgentsCatalogQuery, useAgentsDashboardQuery } from "@/features/agents/use-agents-api";

export default function AgentsOverviewPage() {
  const dash = useAgentsDashboardQuery(90_000);
  const catalog = useAgentsCatalogQuery();

  const dashErr =
    dash.isError && isApiClientError(dash.error)
      ? dash.error.message
      : dash.isError
        ? "AI dashboard could not be loaded. Please try again shortly."
        : null;
  const catErr =
    catalog.isError && isApiClientError(catalog.error)
      ? catalog.error.message
      : catalog.isError
        ? "AI agents could not be loaded. Please try again shortly."
        : null;

  const rewards = dash.data?.reward_summary;

  return (
    <>
      <PageHeader
        title="AI Agents"
        description="Research-backed intelligence routed through Laravel — never calling internal AI URLs from the browser."
      />
      <div className="space-y-6">
        <AgentsDisclaimerBanner />
        {dashErr ? <InlineAlert tone="error">{dashErr}</InlineAlert> : null}
        {catErr ? <InlineAlert tone="error">{catErr}</InlineAlert> : null}

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Agents enabled" value={dash.data?.agents_enabled_count ?? "—"} />
          <Stat label="WFL pending" value={fmtNum(rewards?.pending)} />
          <Stat label="WFL claimable" value={fmtNum(rewards?.claimable)} />
          <Stat label="WFL claimed" value={fmtNum(rewards?.claimed)} />
        </section>

        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/agents/signals" className="text-sky-400 hover:text-sky-300">
            Signals
          </Link>
          <span className="text-zinc-600">·</span>
          <Link href="/agents/history" className="text-sky-400 hover:text-sky-300">
            History
          </Link>
          <span className="text-zinc-600">·</span>
          <Link href="/agents/rewards" className="text-sky-400 hover:text-sky-300">
            Rewards
          </Link>
        </div>

        <section>
          <h2 className="text-sm font-medium text-zinc-300">Latest signals</h2>
          {!dash.data?.latest_signals?.length ? (
            <EmptyState title="No signals yet" description="Run an agent or generate a signal to populate this list." />
          ) : (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {dash.data.latest_signals.slice(0, 4).map((s) => (
                <SignalCard key={s.id} signal={s} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-medium text-zinc-300">Available agents</h2>
          {catalog.isLoading || dash.isLoading ? (
            <p className="mt-3 text-sm text-zinc-500">Loading…</p>
          ) : !catalog.data?.agents?.length ? (
            <EmptyState title="No agents" description="Catalog will appear once the backend registry is seeded." />
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {catalog.data.agents.map((a) => (
                <AgentCard key={a.id} agent={a} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised/20 px-4 py-3">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

function fmtNum(n: number | undefined) {
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
