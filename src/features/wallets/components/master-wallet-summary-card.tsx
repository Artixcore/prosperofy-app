"use client";

import { Check, Copy, Wallet as WalletIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { shortenAddress } from "@/lib/formatters";
import type { MasterWalletSummary } from "@/lib/api/types";

const STATUS_BADGE: Record<string, { label: string; classes: string }> = {
  active: {
    label: "Active",
    classes:
      "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900/55 dark:bg-emerald-950/35 dark:text-emerald-200",
  },
  pending: {
    label: "Setup pending",
    classes:
      "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900/55 dark:bg-amber-950/35 dark:text-amber-100",
  },
  failed: {
    label: "Setup failed",
    classes:
      "border-red-300 bg-red-50 text-red-800 dark:border-red-900/55 dark:bg-red-950/35 dark:text-red-100",
  },
  not_created: {
    label: "Not active",
    classes: "border-border bg-muted text-muted-foreground",
  },
};

type Props = {
  master: MasterWalletSummary;
};

function formatLastUpdated(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MasterWalletSummaryCard({ master }: Props) {
  const [copied, setCopied] = useState(false);
  const badge = STATUS_BADGE[master.status] ?? STATUS_BADGE.not_created;
  const lastUpdated = formatLastUpdated(master.last_synced_at);
  const showEmptyHint =
    master.status === "active" && master.total_balance === "0.00";

  const copyAddress = useCallback(async () => {
    if (!master.address) return;
    try {
      await navigator.clipboard.writeText(master.address);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, [master.address]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <section className="w-full min-w-0 max-w-full rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <WalletIcon className="h-5 w-5 text-primary" aria-hidden />
            <h2 className="text-lg font-semibold text-content-primary">{master.label}</h2>
          </div>
          <p className="mt-1 text-sm text-content-muted">{master.network}</p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge.classes}`}
        >
          {badge.label}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-content-muted">Balance</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-content-primary">
            {master.total_balance}{" "}
            <span className="text-lg font-medium text-content-muted">{master.currency}</span>
          </p>
          {showEmptyHint ? (
            <p className="mt-2 text-sm text-content-muted">
              Your wallet is ready. Add funds to get started.
            </p>
          ) : null}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-content-muted">Address</p>
          {master.address ? (
            <div className="mt-1 flex items-center gap-2">
              <code className="truncate text-sm text-content-primary">
                {shortenAddress(master.address)}
              </code>
              <button
                type="button"
                onClick={() => void copyAddress()}
                className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-content-muted hover:bg-muted"
                aria-label="Copy wallet address"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          ) : (
            <p className="mt-1 text-sm text-content-muted">Available after wallet activation</p>
          )}
          {lastUpdated ? (
            <p className="mt-2 text-xs text-content-muted">Last updated {lastUpdated}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
