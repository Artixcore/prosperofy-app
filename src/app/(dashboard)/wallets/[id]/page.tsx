"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { ErrorState } from "@/components/system/error-state";
import { LoadingState } from "@/components/system/loading-state";
import { FormField } from "@/components/system/form-field";
import { SubmitButton } from "@/components/system/submit-button";
import { InlineAlert } from "@/components/system/inline-alert";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import {
  useBalanceRefreshMutation,
  useBroadcastTxMutation,
  usePrepareTxMutation,
  useSimulateTxMutation,
  useWalletQuery,
} from "@/features/wallets/use-wallet-mutations";

const prepareSchema = z.object({
  to: z.string().min(1, "Recipient required."),
  amount: z.string().optional(),
  network: z.string().optional(),
  asset_type: z.enum(["native", "spl"]).optional(),
  mint: z.string().optional(),
  amount_atomic: z.string().optional(),
});

type PrepareForm = z.infer<typeof prepareSchema>;

function WalletDetailContent({ id }: { id: string }) {
  const { data: wallet, isPending, isError, error, refetch } = useWalletQuery(id);
  const refreshMut = useBalanceRefreshMutation(id);
  const prepareMut = usePrepareTxMutation(id);
  const simulateMut = useSimulateTxMutation(id);
  const broadcastMut = useBroadcastTxMutation(id);
  const [prepareResult, setPrepareResult] = useState<Record<string, unknown> | null>(null);
  const [simulateResult, setSimulateResult] = useState<Record<string, unknown> | null>(null);
  const [txB64, setTxB64] = useState("");
  const [txError, setTxError] = useState<string | null>(null);

  const form = useForm<PrepareForm>({
    resolver: zodResolver(prepareSchema),
    defaultValues: { asset_type: "native" },
  });

  const isSolana = wallet?.chain_type === "solana";

  async function onPrepare(values: PrepareForm) {
    setTxError(null);
    try {
      const body: Record<string, unknown> = {
        to: values.to,
        network: values.network || undefined,
        asset_type: values.asset_type,
        mint: values.mint || undefined,
        amount_atomic: values.amount_atomic || undefined,
      };
      if (values.amount) body.amount = values.amount;
      const res = await prepareMut.mutateAsync(body);
      setPrepareResult(res);
    } catch (e) {
      setTxError(normalizeApiError(e));
    }
  }

  async function runSimulate() {
    setTxError(null);
    try {
      const res = await simulateMut.mutateAsync({
        serialized_transaction_base64: txB64.trim(),
      });
      setSimulateResult(res);
    } catch (e) {
      setSimulateResult(null);
      setTxError(normalizeApiError(e));
    }
  }

  async function runBroadcast() {
    setTxError(null);
    try {
      const idempotency_key =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-broadcast`;
      await broadcastMut.mutateAsync({
        serialized_transaction_base64: txB64.trim(),
        idempotency_key,
      });
      setTxB64("");
      setSimulateResult(null);
    } catch (e) {
      setTxError(normalizeApiError(e));
    }
  }

  if (isPending) return <LoadingState />;
  if (isError || !wallet) {
    return (
      <div className="space-y-4">
        <Link href="/wallets" className="text-sm text-accent-muted hover:underline">
          ← Wallets
        </Link>
        <ErrorState error={error} onRetry={() => void refetch()} />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={wallet.label ?? wallet.provider}
        description={`${wallet.chain_type.toUpperCase()} · ${wallet.address}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/wallets"
              className="rounded-md border border-border px-3 py-2 text-sm text-secondary-foreground hover:bg-secondary"
            >
              All wallets
            </Link>
            <button
              type="button"
              onClick={() => void refreshMut.mutateAsync({})}
              disabled={refreshMut.isPending}
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:brightness-110 disabled:opacity-50"
            >
              {refreshMut.isPending ? "Refreshing…" : "Refresh balance"}
            </button>
          </div>
        }
      />
      {refreshMut.isError ? (
        <InlineAlert tone="error">
          {normalizeApiError(refreshMut.error)}
        </InlineAlert>
      ) : null}
      {txError ? <InlineAlert tone="error">{txError}</InlineAlert> : null}

      <section className="mt-8 space-y-4 rounded-lg border border-surface-border bg-surface-raised/40 p-6">
        <h2 className="text-lg font-medium text-foreground">Prepare transfer</h2>
        <p className="text-sm text-muted-foreground">
          Build an unsigned transaction via Laravel. Sign in your wallet, then paste the serialized
          transaction for simulate/broadcast (Solana only).
        </p>
        <form className="space-y-4" onSubmit={form.handleSubmit(onPrepare)}>
          <FormField id="to" label="To address" error={form.formState.errors.to?.message}>
            <input
              id="to"
              className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
              {...form.register("to")}
            />
          </FormField>
          {isSolana ? (
            <FormField id="asset_type" label="Asset type" error={form.formState.errors.asset_type?.message}>
              <select
                id="asset_type"
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                {...form.register("asset_type")}
              >
                <option value="native">Native SOL</option>
                <option value="spl">SPL token</option>
              </select>
            </FormField>
          ) : null}
          <FormField id="amount" label="Amount" error={form.formState.errors.amount?.message}>
            <input
              id="amount"
              className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
              placeholder={isSolana ? "SOL amount (native)" : "EVM amount"}
              {...form.register("amount")}
            />
          </FormField>
          {isSolana && form.watch("asset_type") === "spl" ? (
            <>
              <FormField id="mint" label="Mint" error={form.formState.errors.mint?.message}>
                <input
                  id="mint"
                  className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                  {...form.register("mint")}
                />
              </FormField>
              <FormField
                id="amount_atomic"
                label="Amount (atomic)"
                error={form.formState.errors.amount_atomic?.message}
              >
                <input
                  id="amount_atomic"
                  className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                  {...form.register("amount_atomic")}
                />
              </FormField>
            </>
          ) : null}
          <FormField id="network" label="Network (optional)" error={form.formState.errors.network?.message}>
            <input
              id="network"
              className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
              {...form.register("network")}
            />
          </FormField>
          <SubmitButton pending={prepareMut.isPending}>Prepare transaction</SubmitButton>
        </form>
        {prepareResult ? (
          <div className="mt-4">
            <p className="text-sm font-medium text-foreground">Prepare response (sanitized display)</p>
            <pre className="mt-2 max-h-48 overflow-auto rounded-md border border-border bg-muted p-3 font-mono text-xs text-muted-foreground">
              {JSON.stringify(prepareResult, null, 2)}
            </pre>
          </div>
        ) : null}
      </section>

      {isSolana ? (
        <section className="mt-8 space-y-4 rounded-lg border border-amber-300 bg-amber-50 p-6 dark:border-amber-900/45 dark:bg-amber-950/30">
          <h2 className="text-lg font-medium text-amber-950 dark:text-amber-100">Solana simulate / broadcast</h2>
          <p className="text-sm text-amber-900 dark:text-amber-200/90">
            Sign the prepared transaction in Phantom, then paste base64 here. Broadcasting submits on-chain
            — confirm only if you intend to send.
          </p>
          <label className="block text-sm text-foreground" htmlFor="txb64">
            Serialized transaction (base64)
          </label>
          <textarea
            id="txb64"
            value={txB64}
            onChange={(e) => setTxB64(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-input bg-surface px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void runSimulate()}
              disabled={simulateMut.isPending || !txB64.trim()}
              className="rounded-md border border-border px-3 py-2 text-sm text-secondary-foreground hover:bg-secondary disabled:opacity-50"
            >
              {simulateMut.isPending ? "Simulating…" : "Simulate"}
            </button>
            <ConfirmDialog
              title="Broadcast transaction?"
              description="This submits a signed transaction to the network. Fees may apply. This action is not easily reversible."
              confirmLabel="Broadcast"
              tone="danger"
              onConfirm={runBroadcast}
            >
              {(open) => (
                <button
                  type="button"
                  onClick={open}
                  disabled={broadcastMut.isPending || !txB64.trim()}
                  className="rounded-md bg-red-800 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Broadcast…
                </button>
              )}
            </ConfirmDialog>
          </div>
          {simulateResult ? (
            <pre className="max-h-48 overflow-auto rounded-md border border-border bg-muted p-3 font-mono text-xs text-muted-foreground">
              {JSON.stringify(simulateResult, null, 2)}
            </pre>
          ) : null}
        </section>
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">
          On-chain simulate/broadcast in this UI is limited to Solana wallets. For EVM, use your wallet
          after prepare or extend the app when Laravel adds EVM broadcast support.
        </p>
      )}
    </>
  );
}

export default function WalletDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : null;

  if (!id) {
    return <ErrorState error={new Error("Invalid wallet id.")} />;
  }

  return <WalletDetailContent id={id} />;
}
