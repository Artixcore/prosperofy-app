import type { WalletOnChainTransactionRow } from "@/lib/api/types";

type ExplorerTxFields = Pick<
  WalletOnChainTransactionRow,
  "explorer_url" | "tx_hash" | "network"
>;

function solanaClusterQueryParam(): string | null {
  const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "mainnet-beta").toLowerCase().trim();
  if (network === "devnet") return "devnet";
  if (network === "testnet") return "testnet";
  return null;
}

export function buildSolscanUrl(txHash: string): string {
  const encoded = encodeURIComponent(txHash.trim());
  const base = `https://solscan.io/tx/${encoded}`;
  const cluster = solanaClusterQueryParam();
  return cluster ? `${base}?cluster=${cluster}` : base;
}

export function resolveExplorerUrl(tx: ExplorerTxFields): string | null {
  if (tx.explorer_url) {
    return tx.explorer_url;
  }
  const hash = tx.tx_hash?.trim();
  if (!hash || tx.network !== "solana") {
    return null;
  }
  return buildSolscanUrl(hash);
}

export function solscanLabel(explorerName?: string | null): string {
  return explorerName === "Solscan" || !explorerName ? "View on Solscan" : `View on ${explorerName}`;
}

export function explorerPendingLabel(tx: ExplorerTxFields): string | null {
  if (resolveExplorerUrl(tx)) {
    return null;
  }
  if (!tx.tx_hash?.trim()) {
    return "Explorer pending";
  }
  return "Link unavailable";
}

export function explorerUnavailableMessage(tx: ExplorerTxFields): string {
  if (!tx.tx_hash?.trim()) {
    return "Explorer link unavailable until transaction is broadcasted.";
  }
  return "Explorer link is temporarily unavailable.";
}
