import type { ExchangeConnectionSummary } from "@/lib/api/types";

export function exchangeLabel(id: string): string {
  if (id === "binance") return "Binance";
  if (id === "coinbase") return "Coinbase";
  return "Bybit";
}

export function statusLabel(row: ExchangeConnectionSummary): string {
  switch (row.status) {
    case "not_connected":
      return "Not connected";
    case "connected":
      return "Connected";
    case "verification_failed":
      return "Verification failed";
    case "disabled":
      return "Disabled";
    case "revoked":
      return "Revoked";
    default:
      return row.status;
  }
}

export function permissionSummary(row: ExchangeConnectionSummary): string {
  const p = row.permissions as Record<string, unknown> | null | undefined;
  if (!p || typeof p !== "object") return "Unknown";
  const w = p.withdrawals_enabled;
  const t = p.trading_enabled;
  const mode = p.mode;
  if (w === true) return "Withdrawals enabled";
  if (t === true) return "Trading enabled";
  if (mode === "read_only" || p.raw_capabilities === undefined) return "Read-only";
  return "Unknown";
}
