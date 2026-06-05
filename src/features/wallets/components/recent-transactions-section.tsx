"use client";

import { ArrowDownLeft, ArrowUpRight, ListOrdered } from "lucide-react";
import Link from "next/link";
import { LoadingState } from "@/components/system/loading-state";
import { SolscanLink } from "@/features/wallets/components/solscan-link";
import { useWalletTransactionsQuery } from "@/features/wallets/use-wallet-send";
import { formatChainName, shortenAddress } from "@/lib/formatters";
import type { WalletOnChainTransactionRow } from "@/lib/api/types";

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

/**
 * Top-5 most-recent on-chain transactions for the WFL wallet. Pulls from the
 * existing `useWalletTransactionsQuery` so empty/loading/error states match
 * the rest of the wallet pages.
 */
export function RecentTransactionsSection() {
  const txs = useWalletTransactionsQuery({ per_page: 5 });

  return (
    <section
      className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-soft"
      aria-label="Recent transactions"
    >
      <header className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-content-primary">
            Recent transactions
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Latest sends and receives across your wallet.
          </p>
        </div>
        <Link
          href="/wallet/transactions"
          className="text-sm font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </header>

      {txs.isPending ? (
        <LoadingState label="Loading transactions…" className="!py-8" />
      ) : txs.isError ? (
        <p className="text-sm text-muted-foreground">
          We could not load transactions right now. Please try again shortly.
        </p>
      ) : !txs.data?.transactions || txs.data.transactions.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="divide-y divide-border">
          {txs.data.transactions.slice(0, 5).map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </ul>
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background/40 px-4 py-10 text-center">
      <ListOrdered className="h-6 w-6 text-muted-foreground" aria-hidden />
      <p className="text-sm font-medium text-content-primary">No transactions yet.</p>
      <p className="text-xs text-muted-foreground">
        Your sends and receives will appear here.
      </p>
    </div>
  );
}

function TransactionRow({ tx }: { tx: WalletOnChainTransactionRow }) {
  const isSend = tx.transaction_type === "send";
  const Icon = isSend ? ArrowUpRight : ArrowDownLeft;
  const badgeClass = STATUS_CLASSES[tx.status] ?? "border-border bg-muted text-muted-foreground";
  const counterparty = isSend ? tx.to_address : tx.from_address;
  const date = tx.broadcasted_at ?? tx.created_at;

  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/wallet/transactions/${tx.id}`}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg hover:bg-muted/50"
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              isSend
                ? "bg-red-50 text-red-700 dark:bg-red-950/35 dark:text-red-200"
                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-200"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-content-primary">
              {isSend ? "Sent" : "Received"} {tx.symbol}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {formatChainName(tx.network)} ·{" "}
              {counterparty ? shortenAddress(counterparty, 4) : "—"}
              {date ? ` · ${formatRelativeDate(date)}` : ""}
            </p>
          </div>
        </Link>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <p
            className={`font-mono text-sm ${
              isSend ? "text-content-primary" : "text-emerald-700 dark:text-emerald-300"
            }`}
          >
            {isSend ? "−" : "+"}
            {tx.amount} {tx.symbol}
          </p>
          <span
            className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${badgeClass}`}
          >
            {tx.status}
          </span>
          {tx.tx_hash ? (
            <SolscanLink tx={tx} className="text-[11px] font-medium" />
          ) : null}
        </div>
      </div>
    </li>
  );
}

function formatRelativeDate(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const diffMs = Date.now() - t;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(t).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
