"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/system/loading-state";
import { ErrorState } from "@/components/system/error-state";
import { useWalletTransactionsQuery } from "@/features/wallets/use-wallet-send";

export default function WalletTransactionsPage() {
  const [network, setNetwork] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const q = useWalletTransactionsQuery({ network, status, per_page: 20, page: 1 });

  return (
    <>
      <PageHeader title="Transactions" description="Send and receive activity for your WFL Wallet." />
      <div className="mb-4 flex flex-wrap gap-3">
        <Link href="/wallet" className="text-sm text-primary hover:underline">
          ← Back to wallet
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
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
      {q.isError ? <ErrorState error={q.error} onRetry={() => void q.refetch()} /> : null}

      {q.data?.transactions?.length === 0 ? (
        <p className="text-sm text-content-muted">No transactions yet.</p>
      ) : null}

      <ul className="space-y-2">
        {q.data?.transactions.map((t) => (
          <li key={t.id}>
            <Link
              href={`/wallet/transactions/${t.id}`}
              className="flex flex-wrap items-center justify-between rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-sm hover:bg-surface-muted"
            >
              <span className="font-medium">
                {t.transaction_type} · {t.symbol} · {t.network}
              </span>
              <span className="text-xs text-content-muted">{t.status}</span>
              <span className="w-full font-mono text-xs text-content-muted">{t.amount}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
