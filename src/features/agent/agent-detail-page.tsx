"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/system/loading-state";
import { ErrorState } from "@/components/system/error-state";
import { useToast } from "@/components/system/toast-context";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import { AGENT_DISCLAIMER } from "@/lib/config/agent-features";
import { TradeSuggestionCard } from "@/features/agent/components/trade-suggestion-card";
import {
  useAgentAnalysesQuery,
  useAgentCapabilitiesQuery,
  useAgentExecutionsQuery,
  useAgentQuery,
  useAgentSuggestionsQuery,
  useCancelSuggestionMutation,
  useCreateSuggestionMutation,
  useExecuteSuggestionMutation,
  useExplainSuggestionMutation,
  useRunAgentMutation,
  useSaveSuggestionMutation,
} from "@/features/agent/use-agents";

export default function AgentDetailPage() {
  const params = useParams<{ agentId: string }>();
  const agentId = params.agentId;
  const { pushToast } = useToast();

  const agent = useAgentQuery(agentId);
  const capabilities = useAgentCapabilitiesQuery();
  const analyses = useAgentAnalysesQuery(agentId);
  const suggestions = useAgentSuggestionsQuery(agentId);
  const executions = useAgentExecutionsQuery(agentId);
  const runMut = useRunAgentMutation(agentId);
  const createSuggestionMut = useCreateSuggestionMutation(agentId);
  const explainMut = useExplainSuggestionMutation(agentId);
  const saveMut = useSaveSuggestionMutation(agentId);
  const cancelMut = useCancelSuggestionMutation(agentId);
  const executeMut = useExecuteSuggestionMutation(agentId);

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

  const a = agent.data;
  const latestAnalysis = analyses.data?.items?.[0];

  return (
    <>
      <PageHeader
        title={a.name}
        description={a.primary_job}
        action={
          <Link href="/agent" className="text-sm text-primary underline">
            Back to agents
          </Link>
        }
      />

      <p className="mb-4 text-xs text-muted-foreground">{AGENT_DISCLAIMER}</p>

      <section className="mb-8 rounded-2xl border border-surface-border bg-surface-elevated p-5">
        <h2 className="text-lg font-semibold">Agent profile</h2>
        <p className="mt-2 text-sm text-muted-foreground">{a.description_prompt}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-content-muted">Type</dt>
            <dd>{a.agent_type}</dd>
          </div>
          <div>
            <dt className="text-content-muted">Status</dt>
            <dd>{a.status}</dd>
          </div>
          <div>
            <dt className="text-content-muted">Symbols</dt>
            <dd>{(a.symbols ?? []).join(", ")}</dd>
          </div>
          <div>
            <dt className="text-content-muted">Timeframe</dt>
            <dd>{a.timeframe ?? "—"}</dd>
          </div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={runMut.isPending}
            onClick={async () => {
              try {
                await runMut.mutateAsync("analysis");
                pushToast({ tone: "success", title: "Analysis completed" });
              } catch (e) {
                pushToast({ tone: "error", title: normalizeApiError(e) });
              }
            }}
            className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
          >
            {runMut.isPending ? "Running…" : "Run analysis"}
          </button>
          {a.can_suggest_trades ? (
            <button
              type="button"
              disabled={createSuggestionMut.isPending}
              onClick={async () => {
                try {
                  await createSuggestionMut.mutateAsync(undefined);
                  pushToast({ tone: "success", title: "Trade suggestion generated" });
                } catch (e) {
                  pushToast({ tone: "error", title: normalizeApiError(e) });
                }
              }}
              className="rounded-md border border-border px-3 py-1.5 text-sm"
            >
              Generate trade suggestion
            </button>
          ) : null}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Latest analysis</h2>
        {latestAnalysis ? (
          <article className="rounded-xl border border-surface-border bg-surface-raised p-4 text-sm">
            <p className="font-medium">
              {latestAnalysis.symbol} · confidence {latestAnalysis.confidence_score ?? "—"}
            </p>
            <p className="mt-2 text-muted-foreground">{latestAnalysis.explanation}</p>
          </article>
        ) : (
          <p className="text-sm text-muted-foreground">No analyses yet. Run analysis to generate one.</p>
        )}
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Trade suggestions</h2>
        <div className="grid gap-4">
          {(suggestions.data?.items ?? []).map((s) => (
            <TradeSuggestionCard
              key={s.id}
              suggestion={s}
              capabilities={capabilities.data}
              agentTradingEnabled={a.can_prepare_executable_trades}
              pending={
                explainMut.isPending ||
                saveMut.isPending ||
                cancelMut.isPending ||
                executeMut.isPending
              }
              onExplain={async () => {
                try {
                  await explainMut.mutateAsync(s.id);
                } catch (e) {
                  pushToast({ tone: "error", title: normalizeApiError(e) });
                }
              }}
              onSave={async () => {
                try {
                  await saveMut.mutateAsync(s.id);
                  pushToast({ tone: "success", title: "Saved for future" });
                } catch (e) {
                  pushToast({ tone: "error", title: normalizeApiError(e) });
                }
              }}
              onCancel={async () => {
                try {
                  await cancelMut.mutateAsync(s.id);
                } catch (e) {
                  pushToast({ tone: "error", title: normalizeApiError(e) });
                }
              }}
              onExecute={async (confirmations, idempotencyKey) => {
                try {
                  const result = await executeMut.mutateAsync({
                    suggestionId: s.id,
                    idempotencyKey,
                    confirmations,
                  });
                  pushToast({
                    tone: "success",
                    title: "Trade submitted",
                    description: result.provider_order_id
                      ? `Order ID: ${result.provider_order_id}`
                      : undefined,
                  });
                } catch (e) {
                  pushToast({ tone: "error", title: normalizeApiError(e) });
                }
              }}
            />
          ))}
          {(suggestions.data?.items ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No trade suggestions yet.</p>
          ) : null}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Execution history</h2>
        <ul className="space-y-2 text-sm">
          {(executions.data?.items ?? []).map((ex) => (
            <li key={ex.id} className="rounded-md border border-border px-3 py-2">
              {ex.symbol} {ex.side} — {ex.status}
              {ex.provider_order_id ? ` · Order ${ex.provider_order_id}` : ""}
            </li>
          ))}
          {(executions.data?.items ?? []).length === 0 ? (
            <li className="text-muted-foreground">No executions yet.</li>
          ) : null}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Research history</h2>
        <ul className="space-y-2 text-sm">
          {(analyses.data?.items ?? []).slice(0, 10).map((item) => (
            <li key={item.id} className="rounded-md border border-border px-3 py-2">
              {item.symbol} · {item.created_at ? new Date(item.created_at).toLocaleString() : ""}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
