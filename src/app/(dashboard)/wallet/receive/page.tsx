"use client";

import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/system/loading-state";
import { ErrorState } from "@/components/system/error-state";
import { InlineAlert } from "@/components/system/inline-alert";
import { useToast } from "@/components/system/toast-context";
import { useReceiveAddressesQuery } from "@/features/wallets/use-wallet-send";
import type { WalletReceiveAddressRow } from "@/lib/api/types";

type Selection = {
  network: string;
  asset_type: string;
  symbol: string;
};

function pickAddress(rows: WalletReceiveAddressRow[], sel: Selection): WalletReceiveAddressRow | undefined {
  return rows.find(
    (r) =>
      r.network === sel.network &&
      r.asset_type === sel.asset_type &&
      r.symbol === sel.symbol,
  );
}

export default function WalletReceivePage() {
  const { pushToast } = useToast();
  const q = useReceiveAddressesQuery();
  const [selection, setSelection] = useState<Selection>({
    network: "solana",
    asset_type: "native",
    symbol: "SOL",
  });

  const rows = useMemo(() => q.data?.addresses ?? [], [q.data?.addresses]);

  const current = useMemo(
    () => pickAddress(rows, selection),
    [rows, selection],
  );

  async function copyAddress() {
    if (!current?.address) return;
    try {
      await navigator.clipboard.writeText(current.address);
      pushToast({
        tone: "success",
        title: "Copied",
        description: "Address copied.",
      });
    } catch {
      pushToast({ tone: "error", title: "Copy failed", description: "Could not copy to clipboard." });
    }
  }

  return (
    <>
      <PageHeader title="Receive" description="Show your public deposit address and QR code." />
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/wallet" className="text-sm text-primary hover:underline">
          ← Back to wallet
        </Link>
        <Link href="/wallet/transactions" className="text-sm text-content-muted hover:underline">
          View transactions
        </Link>
      </div>

      {q.isPending ? <LoadingState /> : null}
      {q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} context="wallet-refresh" />
      ) : null}

      {q.isSuccess && q.data && rows.length === 0 ? (
        <InlineAlert tone="warning">
          No WFL Wallet found. Please create your wallet from the main wallet page first.
        </InlineAlert>
      ) : null}

      {q.isSuccess && rows.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-content-muted" htmlFor="net">
                Select network
              </label>
              <select
                id="net"
                className="w-full rounded-md border border-surface-border bg-surface-elevated px-3 py-2 text-sm"
                value={selection.network}
                onChange={(e) => {
                  const network = e.target.value;
                  if (network === "solana")
                    setSelection({ network, asset_type: "native", symbol: "SOL" });
                  if (network === "ethereum")
                    setSelection({ network, asset_type: "native", symbol: "ETH" });
                  if (network === "bitcoin")
                    setSelection({ network, asset_type: "native", symbol: "BTC" });
                }}
              >
                <option value="solana">Solana</option>
                <option value="ethereum">Ethereum</option>
                <option value="bitcoin">Bitcoin</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-content-muted" htmlFor="asset">
                Asset
              </label>
              <select
                id="asset"
                className="w-full rounded-md border border-surface-border bg-surface-elevated px-3 py-2 text-sm"
                value={`${selection.asset_type}:${selection.symbol}`}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "native:SOL" && selection.network === "solana")
                    setSelection({ network: "solana", asset_type: "native", symbol: "SOL" });
                  if (v === "native:ETH" && selection.network === "ethereum")
                    setSelection({ network: "ethereum", asset_type: "native", symbol: "ETH" });
                  if (v === "native:BTC" && selection.network === "bitcoin")
                    setSelection({ network: "bitcoin", asset_type: "native", symbol: "BTC" });
                }}
              >
                {selection.network === "solana" ? <option value="native:SOL">SOL</option> : null}
                {selection.network === "ethereum" ? <option value="native:ETH">ETH</option> : null}
                {selection.network === "bitcoin" ? <option value="native:BTC">BTC</option> : null}
              </select>
            </div>
            <InlineAlert tone="warning">
              Only send assets on the selected network to this address. Sending the wrong asset or network may
              cause permanent loss.
            </InlineAlert>
          </div>
          <div className="rounded-xl border border-surface-border bg-surface-elevated p-4">
            <h3 className="mb-3 text-sm font-semibold">Your address</h3>
            {current ? (
              <>
                <div className="mb-4 flex justify-center rounded-lg bg-white p-4">
                  <QRCodeSVG value={current.address} size={180} level="M" />
                </div>
                <p className="break-all font-mono text-xs text-content-primary">{current.address}</p>
                <button
                  type="button"
                  className="mt-3 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:brightness-110"
                  onClick={() => void copyAddress()}
                >
                  Copy address
                </button>
                <div className="mt-4">
                  <InlineAlert tone="info">
                    After sending {current.symbol} to this address, return to the Wallet page and click
                    {" "}
                    <Link href="/wallet" className="font-medium underline">
                      Refresh Balance
                    </Link>{" "}
                    if it does not appear automatically.
                  </InlineAlert>
                </div>
              </>
            ) : (
              <p className="text-sm text-content-muted">No address available for this selection.</p>
            )}
          </div>
        </div>
      ) : null}

    </>
  );
}
