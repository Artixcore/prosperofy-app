"use client";

import Link from "next/link";
import type { UserAgentRecord } from "@/lib/api/types";

type Props = {
  agent: UserAgentRecord;
  onRun: () => void;
  onDisable: () => void;
  onDelete: () => void;
  runPending?: boolean;
};

export function AgentCard({ agent, onRun, onDisable, onDelete, runPending }: Props) {
  return (
    <article className="rounded-2xl border border-surface-border bg-surface-elevated p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{agent.name}</h3>
          <p className="text-sm text-muted-foreground">{agent.primary_job}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-content-muted">
            {agent.agent_type.replace(/_/g, " ")}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              agent.status === "active"
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : "bg-surface text-content-muted"
            }`}
          >
            {agent.status}
          </span>
          {agent.can_prepare_executable_trades ? (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-800 dark:text-amber-200">
              Trading enabled
            </span>
          ) : (
            <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-content-muted">
              Research only
            </span>
          )}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-content-muted">Symbols</dt>
          <dd className="text-foreground">{(agent.symbols ?? []).join(", ") || "—"}</dd>
        </div>
        <div>
          <dt className="text-content-muted">Risk</dt>
          <dd className="capitalize text-foreground">{agent.risk_profile}</dd>
        </div>
        <div>
          <dt className="text-content-muted">Analyses</dt>
          <dd className="text-foreground">{agent.total_analyses ?? 0}</dd>
        </div>
        <div>
          <dt className="text-content-muted">Last run</dt>
          <dd className="text-foreground">
            {agent.last_run_at ? new Date(agent.last_run_at).toLocaleString() : "Never"}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/agent/${agent.id}`}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-card-foreground hover:bg-accent"
        >
          View
        </Link>
        <button
          type="button"
          disabled={runPending || agent.status !== "active"}
          onClick={onRun}
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground disabled:opacity-50"
        >
          {runPending ? "Running…" : "Run analysis"}
        </button>
        <button
          type="button"
          onClick={onDisable}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-accent"
        >
          Disable
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md border border-destructive/40 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
