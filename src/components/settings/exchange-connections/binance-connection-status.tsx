"use client";

import type { ExchangeConnectionSummary } from "@/lib/api/types";

export function BinanceConnectionStatus({ connection }: { connection: ExchangeConnectionSummary }) {
  const uid = connection.provider_account_uid ?? connection.binance_uid;
  const masked = connection.masked_api_key ?? (connection.key_display_suffix ? `****${connection.key_display_suffix}` : "—");

  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised/40 p-4 text-sm">
      <p className="font-medium text-foreground">Current connection</p>
      <dl className="mt-2 grid gap-1 text-xs text-muted-foreground">
        <div className="flex justify-between gap-2">
          <dt>Status</dt>
          <dd className="text-foreground">{connection.status}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Mode</dt>
          <dd className="text-foreground">{connection.connection_mode ?? "portfolio_only"}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>API key</dt>
          <dd className="font-mono text-foreground">{masked}</dd>
        </div>
        {uid ? (
          <div className="flex justify-between gap-2">
            <dt>Binance UID</dt>
            <dd className="text-foreground">{uid}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-2">
          <dt>Last verified</dt>
          <dd className="text-foreground">
            {connection.last_verified_at
              ? new Date(connection.last_verified_at).toLocaleString()
              : "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Last synced</dt>
          <dd className="text-foreground">
            {connection.last_synced_at
              ? new Date(connection.last_synced_at).toLocaleString()
              : "—"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
