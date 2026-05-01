"use client";

import Link from "next/link";
import { Wallet } from "lucide-react";
import { useAppDashboardQuery } from "@/features/app/use-app-dashboard";
import { formatCurrency } from "@/lib/formatters";

export function WalletBalanceBadge() {
  const dashboard = useAppDashboardQuery();

  let balanceDisplay: string;
  if (dashboard.isPending) {
    balanceDisplay = "…";
  } else if (dashboard.isError) {
    balanceDisplay = "—";
  } else {
    balanceDisplay = formatCurrency(dashboard.data?.overview.totalBalance ?? 0);
  }

  return (
    <Link
      href="/wallet"
      className="flex max-w-[min(100%,11rem)] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-surface-border bg-surface px-2 py-2 text-xs text-content-primary hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:gap-2 sm:px-3 sm:text-sm motion-safe:transition-colors"
      title="View wallets"
    >
      <Wallet className="h-4 w-4 shrink-0 text-accent" aria-hidden />
      <span className="hidden font-medium sm:inline">WFL Wallet</span>
      {" "}
      <span className="truncate tabular-nums text-content-muted">{balanceDisplay}</span>
    </Link>
  );
}
