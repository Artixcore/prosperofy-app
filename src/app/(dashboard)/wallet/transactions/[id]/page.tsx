"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/system/loading-state";
import { ErrorState } from "@/components/system/error-state";
import { useCancelWalletTransactionMutation, useWalletTransactionQuery } from "@/features/wallets/use-wallet-send";

export default function WalletTransactionDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : null;
  const q = useWalletTransactionQuery(id);
  const cancelMu = useCancelWalletTransactionMutation();

  const t = q.data?.transaction;

  return (
    <>
      <PageHeader title="Transaction" description="Status and on-chain details." />
      <div className="mb-4">
        <Link href="/wallet/transactions" className="text-sm text-primary hover:underline">
          ← All transactions
        </Link>
      </div>

      {q.isPending ? <LoadingState /> : null}
      {q.isError ? <ErrorState error={q.error} onRetry={() => void q.refetch()} /> : null}

      {t ? (
        <div className="space-y-3 rounded-xl border border-surface-border bg-surface-elevated p-4 text-sm">
          <p>
            <strong>Status:</strong> {t.status}
          </p>
          <p>
            <strong>Network:</strong> {t.network} · <strong>Asset:</strong> {t.symbol} ({t.asset_type})
          </p>
          <p className="break-all font-mono text-xs">
            <strong>To:</strong> {t.to_address}
          </p>
          <p>
            <strong>Amount:</strong> {t.amount}
          </p>
          {t.tx_hash ? (
            <p className="break-all font-mono text-xs">
              <strong>Tx hash:</strong> {t.tx_hash}
            </p>
          ) : null}
          {t.explorer_url ? (
            <p>
              <a
                href={t.explorer_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                View on explorer
              </a>
            </p>
          ) : null}
          {t.status === "previewed" ? (
            <button
              type="button"
              className="rounded-md border border-surface-border px-3 py-1.5 text-sm"
              disabled={cancelMu.isPending}
              onClick={() => cancelMu.mutate(t.id)}
            >
              Cancel preview
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
