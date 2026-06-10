"use client";

import { useState } from "react";
import { InlineAlert } from "@/components/system/inline-alert";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import type { YieldOverview, YieldPool } from "@/lib/api/types";
import { useCreateYieldAllocationMutation } from "@/features/yield/use-yield";

type Props = {
  pool: YieldPool;
  overview: YieldOverview;
  onClose: () => void;
};

export function YieldAllocationModal({ pool, overview, onClose }: Props) {
  const createAllocation = useCreateYieldAllocationMutation();
  const [amount, setAmount] = useState("");
  const [autoCompound, setAutoCompound] = useState(false);
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    pool.allocate_enabled &&
    overview.provider_enabled &&
    overview.membership.eligible &&
    riskAcknowledged &&
    amount.trim() !== "" &&
    !createAllocation.isPending;

  async function handleSubmit() {
    setError(null);

    try {
      await createAllocation.mutateAsync({
        pool_id: pool.id,
        amount: amount.trim(),
        currency: overview.save_wallet.currency,
        auto_compound_enabled: autoCompound,
        risk_acknowledged: riskAcknowledged,
      });
      onClose();
    } catch (submitError) {
      setError(normalizeApiError(submitError));
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="yield-allocation-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 id="yield-allocation-title" className="text-lg font-semibold text-content-primary">
          Allocate to {pool.name}
        </h2>
        <p className="mt-1 text-sm text-content-muted">
          Save Wallet balance: {overview.save_wallet.balance} {overview.save_wallet.currency}
        </p>

        {!overview.provider_enabled ? (
          <div className="mt-4">
            <InlineAlert tone="info">
              Yield allocations are not available yet. You can review the feature, but deposits are
              disabled until the provider is live.
            </InlineAlert>
          </div>
        ) : null}

        <div className="mt-4 space-y-4">
          <label className="block text-sm">
            <span className="font-medium text-content-primary">Amount</span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              disabled={!overview.provider_enabled}
            />
          </label>

          {pool.auto_compound_supported ? (
            <label className="flex items-center gap-2 text-sm text-content-primary">
              <input
                type="checkbox"
                checked={autoCompound}
                onChange={(event) => setAutoCompound(event.target.checked)}
                disabled={!overview.provider_enabled}
              />
              Enable auto-compounding
            </label>
          ) : null}

          <label className="flex items-start gap-2 text-sm text-content-primary">
            <input
              type="checkbox"
              checked={riskAcknowledged}
              onChange={(event) => setRiskAcknowledged(event.target.checked)}
              className="mt-0.5"
            />
            <span>
              I understand yield pools involve risk and returns are not guaranteed.
            </span>
          </label>
        </div>

        {error ? (
          <div className="mt-4">
            <InlineAlert tone="error">{error}</InlineAlert>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!canSubmit}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createAllocation.isPending ? "Submitting…" : "Confirm allocation"}
          </button>
        </div>
      </div>
    </div>
  );
}
