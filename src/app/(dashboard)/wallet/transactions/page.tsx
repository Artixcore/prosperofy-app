"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/system/loading-state";
import { ErrorState } from "@/components/system/error-state";
import { SolscanLink } from "@/features/wallets/components/solscan-link";
import {
  useWalletTransactionsQuery,
  useWalletTransactionsSyncMutation,
} from "@/features/wallets/use-wallet-send";
import { useToast } from "@/components/system/toast-context";
import { normalizeApiError } from "@/lib/api/normalize-api-error";

function shortAddr(s: string | null | undefined, n = 6): string {
  if (!s) return "—";
  if (s.length <= n * 2 + 1) return s;
  return `${s.slice(0, n)}…${s.slice(-n)}`;
}

const STATUS_CLASSES: Record<string, string> = {
  confirmed:
    "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900/55 dark:bg-emerald-950/35 dark:text-emerald-200",
  broadcasted:
    "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900/55 dark:bg-amber-950/35 dark:text-amber-100",
  pending:
    "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900/55 dark:bg-amber-950/35 dark:text-amber-100",
  previewed: "border-border bg-muted text-muted-foreground",
  failed:
    "border-red-300 bg-red-50 text-red-700 dark:border-red-900/55 dark:bg-red-950/35 dark:text-red-200",
  cancelled: "border-border bg-muted text-muted-foreground",
};

export default function WalletTransactionsPage() {
  const { pushToast } = useToast();
  const [network, setNetwork] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const q = useWalletTransactionsQuery({ network, status, per_page: 20, page: 1 });
  const syncMu = useWalletTransactionsSyncMutation();

  useEffect(() => {
    if (!syncMu.isPending) {
      void runSync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync once on mount
  }, []);

  async function runSync() {
    try {
      const res = await syncMu.mutateAsync();
      pushToast({
        tone: res.not_implemented ? "info" : "success",
        title: res.not_implemented ? "Deposit sync unavailable" : "Deposits synced",
        description: res.not_implemented
          ? "Incoming receive history is not enabled on this deployment yet."
          : `Imported or updated ${res.synced_count} transaction(s).`,
      });
    } catch (e) {
      pushToast({
        tone: "error",
        title: "Sync failed",
        description: normalizeApiError(e),
      });
    }
  }

  return (
    <>
      <PageHeader title="Transactions" description="Send and receive activity for your WFL Wallet." />
      <div className="mb-4 flex flex-wrap gap-3">
        <Link href="/wallet" className="text-sm text-primary hover:underline">
          ← Back to wallet
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={syncMu.isPending}
          onClick={() => void runSync()}
          className="rounded-md border border-surface-border bg-surface-elevated px-3 py-1 text-sm hover:bg-surface-muted disabled:opacity-50"
        >
          {syncMu.isPending ? "Syncing…" : "Sync on-chain deposits"}
        </button>
        <select
          className="rounded-md border border-surface-border bg-surface-elevated px-2 py-1 text-sm"
          value={network ?? ""}
          onChange={(e) => setNetwork(e.target.value || undefined)}
        >
          <option value="">All networks</option>
          <option value="solana">solana</option>
          <option value="ethereum">ethereum</option>
          <option value="bitcoin">bitcoin</option>
        </select>
        <select
          className="rounded-md border border-surface-border bg-surface-elevated px-2 py-1 text-sm"
          value={status ?? ""}
          onChange={(e) => setStatus(e.target.value || undefined)}
        >
          <option value="">All statuses</option>
          <option value="previewed">previewed</option>
          <option value="broadcasted">broadcasted</option>
          <option value="confirmed">confirmed</option>
          <option value="failed">failed</option>
          <option value="cancelled">cancelled</option>
        </select>
      </div>

      {q.isPending ? <LoadingState /> : null}
      {q.isError ? (
        <ErrorState
          title="Transactions could not be loaded. Please try again shortly."
          error={q.error}
          onRetry={() => void q.refetch()}
        />
      ) : null}

      {q.data?.transactions?.length === 0 ? (
        <p className="text-sm text-content-muted">No transactions yet.</p>
      ) : null}

      <ul className="space-y-2">
        {q.data?.transactions.map((t) => {
          const counterparty =
            t.transaction_type === "receive" ? t.from_address : t.to_address;
          const badgeClass =
            STATUS_CLASSES[t.status] ?? "border-border bg-muted text-muted-foreground";

          return (
            <li key={t.id}>
              <div className="flex flex-wrap items-stretch gap-2 rounded-lg border border-surface-border bg-surface-elevated">
                <Link
                  href={`/wallet/transactions/${t.id}`}
                  className="flex min-w-0 flex-1 flex-col gap-1 px-3 py-2 text-sm hover:bg-surface-muted"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium capitalize">
                      {t.transaction_type} · {t.symbol}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${badgeClass}`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-content-muted">
                    {t.amount} {t.symbol}
                    {t.tx_hash ? <> · {shortAddr(t.tx_hash, 5)}</> : null}
                  </span>
                  {counterparty ? (
                    <span className="text-[11px] text-content-muted">
                      {t.transaction_type === "receive" ? "From" : "To"} {shortAddr(counterparty, 5)}
                    </span>
                  ) : null}
                  {t.created_at ? (
                    <span className="text-[11px] text-content-muted">{t.created_at}</span>
                  ) : null}
                </Link>
                <div className="flex shrink-0 items-center border-l border-surface-border px-3">
                  <SolscanLink tx={t} stopPropagation />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
