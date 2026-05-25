"use client";

import type { WalletOnChainTransactionRow } from "@/lib/api/types";
import {
  explorerPendingLabel,
  explorerUnavailableMessage,
  resolveExplorerUrl,
  solscanLabel,
} from "@/features/wallets/explorer-url";

type SolscanLinkProps = {
  tx: Pick<WalletOnChainTransactionRow, "explorer_url" | "tx_hash" | "network" | "explorer_name">;
  variant?: "inline" | "detail";
  className?: string;
  stopPropagation?: boolean;
};

export function SolscanLink({
  tx,
  variant = "inline",
  className = "",
  stopPropagation = false,
}: SolscanLinkProps) {
  const url = resolveExplorerUrl(tx);
  const pending = explorerPendingLabel(tx);

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
        className={
          variant === "detail"
            ? `inline-flex rounded-md border border-surface-border bg-surface-elevated px-3 py-1.5 text-sm font-medium text-primary hover:bg-surface-muted hover:underline ${className}`
            : `shrink-0 text-xs font-medium text-primary hover:underline ${className}`
        }
      >
        {solscanLabel(tx.explorer_name)}
      </a>
    );
  }

  if (variant === "detail") {
    return (
      <p className={`text-sm text-content-muted ${className}`}>{explorerUnavailableMessage(tx)}</p>
    );
  }

  if (pending) {
    return <span className={`text-xs text-content-muted ${className}`}>{pending}</span>;
  }

  return null;
}
