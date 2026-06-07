"use client";

import type { ReactNode } from "react";
import {
  connectionModeLabel,
  connectionStatusBadge,
} from "@/features/settings/settings-utils";
import type { ExchangeConnectionSummary } from "@/lib/api/types";

function StatusBadge({ status }: { status: string }) {
  const { label, tone } = connectionStatusBadge(status);
  const toneClass =
    tone === "success"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
      : tone === "warning"
        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
        : tone === "error"
          ? "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200"
          : "bg-muted text-muted-foreground";

  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${toneClass}`}>
      {label}
    </span>
  );
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[120px_minmax(0,1fr)]">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-sm text-foreground">{children}</dd>
    </div>
  );
}

export function BinanceConnectionStatus({ connection }: { connection: ExchangeConnectionSummary }) {
  const uid = connection.provider_account_uid ?? connection.binance_uid;
  const masked =
    connection.masked_api_key ??
    (connection.key_display_suffix ? `****${connection.key_display_suffix}` : "Not available");

  return (
    <div className="min-w-0 max-w-full rounded-lg border border-surface-border bg-surface-raised/40 p-4">
      <p className="text-sm font-medium text-foreground">Current connection</p>
      <dl className="mt-3 space-y-3">
        <DetailRow label="Status">
          <StatusBadge status={connection.status} />
        </DetailRow>
        <DetailRow label="Mode">{connectionModeLabel(connection.connection_mode)}</DetailRow>
        <DetailRow label="API key">
          <span className="break-all font-medium">{masked}</span>
        </DetailRow>
        {uid ? (
          <DetailRow label="Binance UID">
            <span className="break-all">{uid}</span>
          </DetailRow>
        ) : null}
        <DetailRow label="Last verified">
          {connection.last_verified_at
            ? new Date(connection.last_verified_at).toLocaleString()
            : "Not verified yet"}
        </DetailRow>
        <DetailRow label="Last synced">
          {connection.last_synced_at
            ? new Date(connection.last_synced_at).toLocaleString()
            : "Not synced yet"}
        </DetailRow>
      </dl>
    </div>
  );
}
