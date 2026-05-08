"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Copy,
  ListOrdered,
  Wallet as WalletIcon,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  primaryWalletAddress,
  shouldEnableSend,
  wflWalletState,
} from "@/features/wallets/wallet-derive";
import { formatChainName, shortenAddress } from "@/lib/formatters";
import type { WalletOverview } from "@/lib/api/types";

type Props = {
  overview: WalletOverview | null | undefined;
};

const STATUS_BADGE: Record<
  ReturnType<typeof wflWalletState>["status"],
  { label: string; classes: string }
> = {
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
  missing: {
    label: "Not active",
    classes: "border-border bg-muted text-muted-foreground",
  },
};

/**
 * Primary balance card. Shows the WFL wallet status, total balance (whatever
 * the backend supplies — currently 0.00 as a placeholder), the user's primary
 * receive address with a copy-to-clipboard control, and the three primary
 * actions (Receive, Send, View transactions). Send is disabled unless the WFL
 * wallet is active so users never get stuck mid-flow.
 */
export function WalletBalanceCard({ overview }: Props) {
  const state = wflWalletState(overview);
  const primary = primaryWalletAddress(overview);
  const sendEnabled = shouldEnableSend(overview);
  const summary = overview?.summary ?? { total_balance: "0.00", currency: "USD" };
  const badge = STATUS_BADGE[state.status];
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(t);
  }, [copied]);

  const handleCopy = useCallback(async () => {
    if (!primary) return;
    try {
      await navigator.clipboard.writeText(primary.address);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, [primary]);

  return (
    <section
      className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-soft"
      aria-label="WFL Wallet"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <WalletIcon className="h-4 w-4" aria-hidden />
            <span>WFL Wallet balance</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-semibold tracking-tight text-content-primary sm:text-4xl">
              {formatBalanceDisplay(summary.total_balance)}
            </p>
            <span className="text-sm font-medium text-muted-foreground">
              {summary.currency || "USD"}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge.classes}`}
            >
              {badge.label}
            </span>
            {primary ? (
              <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                {formatChainName(primary.network)}
              </span>
            ) : null}
          </div>

          {primary ? (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Receive address
              </span>
              <code className="rounded-md border border-border bg-muted px-2 py-1 font-mono text-xs text-content-primary">
                {shortenAddress(primary.address, 6)}
              </code>
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={copied ? "Address copied" : "Copy wallet address"}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" aria-hidden /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden /> Copy
                  </>
                )}
              </button>
            </div>
          ) : state.status === "pending" ? (
            <p className="mt-5 text-sm text-muted-foreground">
              Your wallet addresses appear here once setup completes.
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 lg:w-64 lg:shrink-0">
          <Link
            href="/wallet/receive"
            className={`inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium ${
              state.status === "active"
                ? "bg-card text-content-primary hover:bg-muted"
                : "pointer-events-none opacity-50"
            }`}
            aria-disabled={state.status !== "active"}
          >
            <ArrowDownLeft className="h-4 w-4" aria-hidden /> Receive
          </Link>
          {sendEnabled ? (
            <Link
              href="/wallet/send"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground motion-safe:transition-[filter] hover:brightness-110"
            >
              <ArrowUpRight className="h-4 w-4" aria-hidden /> Send
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-md bg-primary/60 px-4 py-2 text-sm font-medium text-primary-foreground opacity-60"
              title="Activate your WFL Wallet to send."
            >
              <ArrowUpRight className="h-4 w-4" aria-hidden /> Send
            </button>
          )}
          <Link
            href="/wallet/transactions"
            className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ListOrdered className="h-4 w-4" aria-hidden /> View transactions
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Pretty-prints a numeric string from the backend without trusting locale code
 * to format leading zeroes (so "0" → "0.00", "1234.5" → "1,234.50").
 */
function formatBalanceDisplay(raw: string | null | undefined): string {
  if (!raw) return "0.00";
  const n = Number(raw);
  if (!Number.isFinite(n)) return raw;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
