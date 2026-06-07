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

export function connectionStatusBadge(status: string): {
  label: string;
  tone: "success" | "warning" | "muted" | "error";
} {
  switch (status) {
    case "connected":
      return { label: "Active", tone: "success" };
    case "verification_failed":
      return { label: "Needs attention", tone: "warning" };
    case "disabled":
    case "revoked":
      return { label: "Inactive", tone: "muted" };
    case "not_connected":
      return { label: "Not connected", tone: "muted" };
    default:
      return { label: status, tone: "muted" };
  }
}

export function connectionModeLabel(mode: string | null | undefined): string {
  if (mode === "trading") return "Trading";
  if (mode === "portfolio_only") return "Portfolio only";
  return "Portfolio only";
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
