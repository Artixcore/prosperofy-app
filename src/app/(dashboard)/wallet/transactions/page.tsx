"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/system/loading-state";
import { ErrorState } from "@/components/system/error-state";
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

export default function WalletTransactionsPage() {
  const { pushToast } = useToast();
  const [network, setNetwork] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const q = useWalletTransactionsQuery({ network, status, per_page: 20, page: 1 });
  const syncMu = useWalletTransactionsSyncMutation();

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
          title="Transactions could not be loaded"
          error={q.error}
          onRetry={() => void q.refetch()}
        />
      ) : null}

      {q.data?.transactions?.length === 0 ? (
        <p className="text-sm text-content-muted">No transactions yet.</p>
      ) : null}

      <ul className="space-y-2">
        {q.data?.transactions.map((t) => {
          const explorer =
            t.explorer_url ??
            (t.tx_hash && t.network === "solana"
              ? `https://solscan.io/tx/${encodeURIComponent(t.tx_hash)}`
              : null);
          const counterparty =
            t.transaction_type === "receive" ? t.from_address : t.to_address;

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
                    <span className="text-xs text-content-muted">{t.status}</span>
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
                {explorer ? (
                  <a
                    href={explorer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex shrink-0 items-center border-l border-surface-border px-3 text-xs text-primary hover:bg-surface-muted hover:underline"
                  >
                    Explorer
                  </a>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
