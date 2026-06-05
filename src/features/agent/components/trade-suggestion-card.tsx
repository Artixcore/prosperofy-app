"use client";

import { useState } from "react";
import type { AgentTradeSuggestionRecord } from "@/lib/api/types";
import type { AgentCapabilities } from "@/lib/api/types";
import { AGENT_DISCLAIMER } from "@/lib/config/agent-features";
import { TradeExecutionWarningModal } from "./trade-execution-warning-modal";

type Props = {
  suggestion: AgentTradeSuggestionRecord;
  capabilities?: AgentCapabilities;
  agentTradingEnabled?: boolean;
  onExplain: () => void;
  onSave: () => void;
  onCancel: () => void;
  onExecute: (confirmations: Record<string, boolean>, idempotencyKey: string) => void;
  pending?: boolean;
};

export function TradeSuggestionCard({
  suggestion,
  capabilities,
  agentTradingEnabled,
  onExplain,
  onSave,
  onCancel,
  onExecute,
  pending,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  const canExecute =
    agentTradingEnabled &&
    capabilities?.trade_execution_enabled &&
    capabilities?.has_trading_binance_connection &&
    !suggestion.is_expired &&
    (suggestion.status === "suggested" || suggestion.status === "saved");

  return (
    <>
      <article className="rounded-xl border border-surface-border bg-surface-raised p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="font-semibold text-foreground">
            {suggestion.symbol} · {suggestion.side.toUpperCase()}
          </h4>
          <span className="text-xs uppercase text-content-muted">{suggestion.status}</span>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-content-muted">Entry</dt>
            <dd>{suggestion.suggested_entry_price ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-content-muted">Stop loss</dt>
            <dd>{suggestion.stop_loss_price ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-content-muted">Take profit</dt>
            <dd>{suggestion.take_profit_price ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-content-muted">R:R</dt>
            <dd>{suggestion.risk_reward_ratio ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-content-muted">Confidence</dt>
            <dd>{suggestion.confidence_score ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-content-muted">Expires</dt>
            <dd>
              {suggestion.expires_at
                ? new Date(suggestion.expires_at).toLocaleString()
                : "—"}
            </dd>
          </div>
        </dl>

        {suggestion.reasoning ? (
          <p className="mt-3 text-sm text-muted-foreground">{suggestion.reasoning}</p>
        ) : null}

        <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">{AGENT_DISCLAIMER}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onExplain}
            disabled={pending}
            className="rounded-md border border-border px-3 py-1.5 text-sm"
          >
            Explain
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={pending}
            className="rounded-md border border-border px-3 py-1.5 text-sm"
          >
            Save for Future
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-md border border-border px-3 py-1.5 text-sm"
          >
            Cancel
          </button>
          {canExecute ? (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              disabled={pending}
              className="rounded-md bg-destructive px-3 py-1.5 text-sm text-destructive-foreground"
            >
              Execute
            </button>
          ) : null}
        </div>
      </article>

      <TradeExecutionWarningModal
        open={modalOpen}
        suggestion={suggestion}
        onClose={() => setModalOpen(false)}
        onConfirm={(confirmations, idempotencyKey) => {
          onExecute(confirmations, idempotencyKey);
          setModalOpen(false);
        }}
        pending={pending}
      />
    </>
  );
}
