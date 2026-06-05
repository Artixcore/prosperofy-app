"use client";

import { useState } from "react";
import type { AgentTradeSuggestionRecord } from "@/lib/api/types";
import { AGENT_DISCLAIMER } from "@/lib/config/agent-features";

type Props = {
  open: boolean;
  suggestion: AgentTradeSuggestionRecord;
  onClose: () => void;
  onConfirm: (confirmations: Record<string, boolean>, idempotencyKey: string) => void;
  pending?: boolean;
};

export function TradeExecutionWarningModal({
  open,
  suggestion,
  onClose,
  onConfirm,
  pending,
}: Props) {
  const [reviewed, setReviewed] = useState(false);
  const [understandLoss, setUnderstandLoss] = useState(false);
  const [notAdvice, setNotAdvice] = useState(false);
  const [wantExecute, setWantExecute] = useState(false);

  if (!open) return null;

  const allChecked = reviewed && understandLoss && notAdvice && wantExecute;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-[2px]"
      role="presentation"
      onClick={() => !pending && onClose()}
    >
      <div
        className="max-w-lg rounded-lg border border-border bg-card p-6 text-card-foreground shadow-xl"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">Trading risk warning</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          This trade was prepared using automated analysis and advanced calculations, but it
          can still lose money. Market conditions can change instantly. Prosperofy does not
          guarantee profit, accuracy, or performance. This is not financial advice.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Review the symbol, side, amount, entry, stop loss, and take profit before continuing.
          Only execute this trade if you understand and accept the risk.
        </p>

        <dl className="mt-4 rounded-md border border-border bg-surface p-3 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-content-muted">Symbol</dt>
            <dd>{suggestion.symbol}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-content-muted">Side</dt>
            <dd className="uppercase">{suggestion.side}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-content-muted">Entry</dt>
            <dd>{suggestion.suggested_entry_price ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-content-muted">Stop loss</dt>
            <dd>{suggestion.stop_loss_price ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-content-muted">Take profit</dt>
            <dd>{suggestion.take_profit_price ?? "—"}</dd>
          </div>
        </dl>

        <div className="mt-4 space-y-2 text-sm">
          <label className="flex items-start gap-2">
            <input type="checkbox" checked={reviewed} onChange={(e) => setReviewed(e.target.checked)} />
            <span>I reviewed this trade.</span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={understandLoss}
              onChange={(e) => setUnderstandLoss(e.target.checked)}
            />
            <span>I understand I can lose money.</span>
          </label>
          <label className="flex items-start gap-2">
            <input type="checkbox" checked={notAdvice} onChange={(e) => setNotAdvice(e.target.checked)} />
            <span>I understand this is not financial advice.</span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={wantExecute}
              onChange={(e) => setWantExecute(e.target.checked)}
            />
            <span>I want to execute this trade on my connected Binance account.</span>
          </label>
        </div>

        <p className="mt-3 text-xs text-amber-800 dark:text-amber-200">{AGENT_DISCLAIMER}</p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!allChecked || pending}
            onClick={() =>
              onConfirm(
                {
                  reviewed_trade: true,
                  understand_can_lose_money: true,
                  understand_not_financial_advice: true,
                  want_to_execute: true,
                },
                crypto.randomUUID(),
              )
            }
            className="rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground disabled:opacity-50"
          >
            {pending ? "Executing…" : "Confirm Execute"}
          </button>
        </div>
      </div>
    </div>
  );
}
