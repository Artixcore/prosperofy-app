"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ErrorState } from "@/components/system/error-state";
import { InlineAlert } from "@/components/system/inline-alert";
import { LoadingState } from "@/components/system/loading-state";
import { PageHeader } from "@/components/page-header";
import { BinanceConnectForm } from "@/components/settings/exchange-connections/binance-connect-form";
import { BinanceConnectionStatus } from "@/components/settings/exchange-connections/binance-connection-status";
import { BinanceInstructionsPanel } from "@/components/settings/exchange-connections/binance-instructions-panel";
import { BinancePortfolioPreview } from "@/components/settings/exchange-connections/binance-portfolio-preview";
import {
  useDeleteExchangeConnectionMutation,
  useExchangeConnectionsQuery,
  useRevalidateExchangeConnectionMutation,
} from "@/features/exchanges/use-exchange-connections";
import type { ExchangeConnectionSummary } from "@/lib/api/types";
import { friendlySettingsError } from "@/lib/api/settings-errors";

function findBinanceConnection(connections: ExchangeConnectionSummary[]): ExchangeConnectionSummary | null {
  return (
    connections.find(
      (c) =>
        (c.exchange === "binance" || c.provider === "binance") &&
        c.status !== "not_connected" &&
        c.id,
    ) ?? null
  );
}

export default function ExchangeConnectionsPage() {
  const connectionsQuery = useExchangeConnectionsQuery();
  const deleteMut = useDeleteExchangeConnectionMutation();
  const revalidateMut = useRevalidateExchangeConnectionMutation();
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState("");
  const [banner, setBanner] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [portfolioKey, setPortfolioKey] = useState(0);

  const binanceConnection = useMemo(() => {
    const list = connectionsQuery.data?.connections ?? connectionsQuery.data?.exchanges ?? [];
    return findBinanceConnection(list);
  }, [connectionsQuery.data]);

  if (connectionsQuery.isPending) {
    return <LoadingState label="Loading exchange connections..." />;
  }

  if (connectionsQuery.isError) {
    return (
      <ErrorState
        error={connectionsQuery.error}
        title="Exchange connections unavailable"
        onRetry={() => void connectionsQuery.refetch()}
      />
    );
  }

  const connectionId = binanceConnection?.id ?? null;
  const connected = Boolean(connectionId && binanceConnection?.status !== "not_connected");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exchange Connections"
        description="Connect your Binance account securely. Credentials are encrypted on Prosperofy servers and never stored in your browser."
        action={
          <Link href="/settings" className="text-sm text-emerald-700 hover:underline dark:text-emerald-300">
            ← Back to Settings
          </Link>
        }
      />

      {banner ? <InlineAlert tone={banner.tone}>{banner.message}</InlineAlert> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <BinanceInstructionsPanel />
        <div className="space-y-4">
          {connected && binanceConnection ? <BinanceConnectionStatus connection={binanceConnection} /> : null}
          <BinanceConnectForm
            onSaved={() => {
              void connectionsQuery.refetch();
              setPortfolioKey((k) => k + 1);
            }}
          />
        </div>
      </div>

      {connected && connectionId ? (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-foreground">Portfolio preview</h2>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-md border border-border px-2 py-1.5 text-xs text-foreground hover:bg-muted"
                onClick={async () => {
                  setBanner(null);
                  try {
                    await revalidateMut.mutateAsync(connectionId);
                    setBanner({ tone: "success", message: "Connection revalidated." });
                    void connectionsQuery.refetch();
                  } catch (e) {
                    setBanner({ tone: "error", message: friendlySettingsError(e) });
                  }
                }}
              >
                Revalidate
              </button>
              <button
                type="button"
                className="rounded-md border border-red-300 px-2 py-1.5 text-xs font-medium text-red-800 hover:bg-red-50 dark:border-red-900/50 dark:text-red-200"
                onClick={() => setDisconnectOpen(true)}
              >
                Remove connection
              </button>
            </div>
          </div>
          <BinancePortfolioPreview
            key={portfolioKey}
            connectionId={connectionId}
            onRetry={() => void connectionsQuery.refetch()}
          />
        </section>
      ) : null}

      <ConfirmDisconnectDialog
        open={disconnectOpen}
        pending={deleteMut.isPending}
        verifyPassword={verifyPassword}
        onVerifyPasswordChange={setVerifyPassword}
        onClose={() => setDisconnectOpen(false)}
        onConfirm={async () => {
          if (!connectionId) return;
          setBanner(null);
          try {
            await deleteMut.mutateAsync({
              id: connectionId,
              body: { current_password: verifyPassword.trim() || undefined },
            });
            setDisconnectOpen(false);
            setVerifyPassword("");
            setBanner({ tone: "success", message: "Binance connection removed." });
            void connectionsQuery.refetch();
          } catch (e) {
            setBanner({ tone: "error", message: friendlySettingsError(e) });
          }
        }}
      />
    </div>
  );
}

function ConfirmDisconnectDialog({
  open,
  pending,
  verifyPassword,
  onVerifyPasswordChange,
  onClose,
  onConfirm,
}: {
  open: boolean;
  pending: boolean;
  verifyPassword: string;
  onVerifyPasswordChange: (v: string) => void;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-[2px]">
      <div className="max-w-md rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl">
        <h3 className="text-lg font-semibold">Remove Binance connection?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Prosperofy will delete stored credentials. Revoke the API key on Binance if you no longer
          need it.
        </p>
        <label className="mt-4 block text-sm text-muted-foreground">
          Current password
          <input
            type="password"
            className="mt-1 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
            value={verifyPassword}
            onChange={(e) => onVerifyPasswordChange(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md border border-border px-3 py-2 text-sm"
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            className="rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground disabled:opacity-60"
            onClick={() => void onConfirm()}
          >
            {pending ? "Please wait…" : "Remove connection"}
          </button>
        </div>
      </div>
    </div>
  );
}
