"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/system/loading-state";
import { ErrorState } from "@/components/system/error-state";
import { CopyableMonoField } from "@/features/wallets/components/copyable-mono-field";
import { SolscanLink } from "@/features/wallets/components/solscan-link";
import { useCancelWalletTransactionMutation, useWalletTransactionQuery } from "@/features/wallets/use-wallet-send";

function shortAddr(s: string, n = 8): string {
  if (s.length <= n * 2 + 1) return s;
  return `${s.slice(0, n)}…${s.slice(-n)}`;
}

function formatType(type: string): string {
  if (type === "send") return "Send";
  if (type === "receive") return "Receive";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-surface-border py-2 last:border-0">
      <span className="text-xs font-medium text-content-muted">{label}</span>
      <div className="text-sm text-content-primary">{children}</div>
    </div>
  );
}

export default function WalletTransactionDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : null;
  const q = useWalletTransactionQuery(id);
  const cancelMu = useCancelWalletTransactionMutation();

  const t = q.data?.transaction;

  return (
    <>
      <PageHeader title="Transaction details" description="Status and on-chain details." />
      <div className="mb-4">
        <Link href="/wallet/transactions" className="text-sm text-primary hover:underline">
          ← All transactions
        </Link>
      </div>

      {q.isPending ? <LoadingState /> : null}
      {q.isError ? (
        <ErrorState
          title="Transaction details could not be loaded."
          error={q.error}
          onRetry={() => void q.refetch()}
        />
      ) : null}

      {t ? (
        <div className="rounded-xl border border-surface-border bg-surface-elevated p-4">
          <DetailRow label="Type">{formatType(t.transaction_type)}</DetailRow>
          <DetailRow label="Status">
            <span className="capitalize">{t.status}</span>
          </DetailRow>
          <DetailRow label="Network">{t.network}</DetailRow>
          <DetailRow label="Asset">
            {t.symbol} ({t.asset_type})
          </DetailRow>
          <DetailRow label="Amount">
            {t.amount} {t.symbol}
          </DetailRow>
          {t.fee_amount ? (
            <DetailRow label="Fee">
              {t.fee_amount} {t.fee_symbol ?? t.symbol}
            </DetailRow>
          ) : null}
          <CopyableMonoField
            label="From"
            value={t.from_address}
            shorten={shortAddr}
            className="border-b border-surface-border py-2"
          />
          <CopyableMonoField
            label="To"
            value={t.to_address}
            shorten={shortAddr}
            className="border-b border-surface-border py-2"
          />
          <CopyableMonoField
            label="Tx hash"
            value={t.tx_hash}
            shorten={(v) => shortAddr(v, 10)}
            className="border-b border-surface-border py-2"
          />
          {t.created_at ? (
            <DetailRow label="Created">{t.created_at}</DetailRow>
          ) : null}
          {t.broadcasted_at ? (
            <DetailRow label="Broadcasted">{t.broadcasted_at}</DetailRow>
          ) : null}
          {t.confirmed_at ? (
            <DetailRow label="Confirmed">{t.confirmed_at}</DetailRow>
          ) : null}
          <div className="flex flex-col gap-2 pt-3">
            <span className="text-xs font-medium text-content-muted">Explorer</span>
            <SolscanLink tx={t} variant="detail" />
          </div>
          {t.status === "previewed" ? (
            <button
              type="button"
              className="mt-4 rounded-md border border-surface-border px-3 py-1.5 text-sm hover:bg-surface-muted"
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
