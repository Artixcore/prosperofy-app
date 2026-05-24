"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { InlineAlert } from "@/components/system/inline-alert";
import { useToast } from "@/components/system/toast-context";
import {
  computeMaxSendableSol,
  formatMaxSendableForInput,
  isAmountAboveMaxSendable,
} from "@/features/wallets/sol-send-limits";
import {
  useAppWalletAssetsQuery,
  useRefreshWalletAssetsMutation,
} from "@/features/wallets/use-wallet-mutations";
import { useSendConfirmMutation, useSendPreviewMutation } from "@/features/wallets/use-wallet-send";
import { getApiErrorData, isApiClientError } from "@/lib/api/errors";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import type { WalletSendPreviewPayload } from "@/lib/api/types";
import {
  walletSendBitcoinEnabled,
  walletSendEthereumEnabled,
  walletSendSolanaEnabled,
  walletSendSplEnabled,
} from "@/lib/config/wallet-features";

type PreviewErrorState = {
  message: string;
  code: string | null;
  maxSendableAmount: string | null;
};

function buildPreviewError(error: unknown): PreviewErrorState {
  const message = normalizeApiError(error) || "Network fee could not be estimated. Please try again.";
  const code = isApiClientError(error) ? error.code : null;
  const data = getApiErrorData(error);
  const maxRaw = data?.max_sendable_amount;
  const maxSendableAmount = typeof maxRaw === "string" ? maxRaw : null;

  return { message, code, maxSendableAmount };
}

export default function WalletSendPage() {
  const { pushToast } = useToast();
  const assets = useAppWalletAssetsQuery();
  const refreshMu = useRefreshWalletAssetsMutation();
  const previewMu = useSendPreviewMutation();
  const confirmMu = useSendConfirmMutation();

  const [network, setNetwork] = useState("solana");
  const [assetType, setAssetType] = useState("native");
  const [symbol, setSymbol] = useState("SOL");
  const [tokenMint, setTokenMint] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState<WalletSendPreviewPayload | null>(null);
  const [previewError, setPreviewError] = useState<PreviewErrorState | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [acceptedRisk, setAcceptedRisk] = useState(false);
  const [armSeconds, setArmSeconds] = useState(0);
  const idempotencyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!confirmOpen) return;
    setAcceptedRisk(false);
    setArmSeconds(5);
    const started = Date.now();
    const id = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - started) / 1000);
      const left = Math.max(0, 5 - elapsed);
      setArmSeconds(left);
      if (left <= 0) window.clearInterval(id);
    }, 300);
    return () => window.clearInterval(id);
  }, [confirmOpen]);

  const balanceHint =
    (() => {
      const list = assets.data?.assets ?? [];
      const match = list.find(
        (a) =>
          ((a.network ?? a.chain)?.toLowerCase() === network) &&
          a.symbol?.toUpperCase() === symbol.toUpperCase(),
      );
      return match?.balance ?? match?.balance_cache ?? null;
    })();

  const isSolNative = network === "solana" && assetType === "native" && symbol.toUpperCase() === "SOL";

  const maxSendable = useMemo(() => {
    if (!isSolNative || !balanceHint) return null;
    return computeMaxSendableSol(balanceHint);
  }, [isSolNative, balanceHint]);

  const amountExceedsMax =
    isSolNative &&
    amount.trim() !== "" &&
    isAmountAboveMaxSendable(amount.trim(), maxSendable);

  const cannotCoverFees = isSolNative && balanceHint !== null && maxSendable === null;

  const handleRefreshBalance = async () => {
    try {
      const result = await refreshMu.mutateAsync({ force: true });
      setPreviewError(null);
      pushToast({
        tone: "success",
        title: result.from_cache ? "Already up to date" : "Balances refreshed",
        description: result.from_cache
          ? "Your wallet balances were synced very recently."
          : "Latest on-chain balances are loaded.",
      });
    } catch (error) {
      pushToast({
        tone: "error",
        title: "Could not refresh balance",
        description:
          normalizeApiError(error) ||
          "Balance refresh failed. Please try again shortly.",
      });
    }
  };

  const handleMaxAmount = () => {
    if (!maxSendable) return;
    setAmount(formatMaxSendableForInput(maxSendable));
    setPreviewError(null);
  };

  async function runPreview() {
    idempotencyRef.current = null;
    setPreview(null);
    setPreviewError(null);
    try {
      const body = {
        network,
        asset_type: assetType as "native" | "spl" | "erc20" | "btc",
        symbol,
        token_address:
          assetType === "spl" || assetType === "erc20"
            ? tokenMint.trim() || null
            : null,
        to_address: toAddress.trim(),
        amount: amount.trim(),
      };
      const data = await previewMu.mutateAsync(body);
      setPreview(data);
      pushToast({ tone: "success", title: "Preview ready", description: "Review fees and confirm." });
    } catch (e) {
      setPreviewError(buildPreviewError(e));
    }
  }

  async function runConfirm() {
    if (!preview) return;
    if (!acceptedRisk) return;
    if (!idempotencyRef.current) {
      idempotencyRef.current = crypto.randomUUID();
    }
    try {
      const data = await confirmMu.mutateAsync({
        preview_id: preview.preview_id,
        idempotency_key: idempotencyRef.current,
      });
      const txHash = data.transaction?.tx_hash ?? data.tx_hash;
      pushToast({
        tone: "success",
        title: data.duplicate ? "Already sent" : "SOL sent successfully.",
        description: txHash ? `Tx ${txHash.slice(0, 8)}…` : "Broadcast submitted.",
      });
      setConfirmOpen(false);
      setPreview(null);
      setAcceptedRisk(false);
      idempotencyRef.current = null;
    } catch (e) {
      pushToast({
        tone: "error",
        title: "Send failed",
        description: normalizeApiError(e) || "Transaction could not be sent. Please try again shortly.",
      });
    }
  }

  const sendAllowed =
    (network === "solana" && assetType === "native" && walletSendSolanaEnabled()) ||
    (network === "solana" && assetType === "spl" && walletSendSplEnabled()) ||
    (network === "ethereum" && walletSendEthereumEnabled()) ||
    (network === "bitcoin" && walletSendBitcoinEnabled());

  const previewDisabled =
    !sendAllowed ||
    previewMu.isPending ||
    cannotCoverFees ||
    amountExceedsMax ||
    (isSolNative && amount.trim() === "");

  const showRefreshOnError =
    previewError?.code === "wallet_balance_not_synced" ||
    previewError?.code === "wallet_balance_stale";

  return (
    <>
      <PageHeader
        title="Send"
        description="Preview fees, then confirm an on-chain transfer from your WFL Wallet."
        action={
          <button
            type="button"
            onClick={() => void handleRefreshBalance()}
            disabled={refreshMu.isPending || assets.isFetching}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-content-primary shadow-sm hover:bg-muted disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshMu.isPending || assets.isFetching ? "animate-spin" : ""}`}
              aria-hidden
            />
            {refreshMu.isPending ? "Refreshing…" : "Refresh Balance"}
          </button>
        }
      />
      <div className="mb-4 flex gap-3">
        <Link href="/wallet" className="text-sm text-primary hover:underline">
          ← Back to wallet
        </Link>
      </div>

      {!sendAllowed ? (
        <InlineAlert tone="warning">
          This network is not supported for sending yet. Enable it in environment flags after the chain is live.
        </InlineAlert>
      ) : null}

      {cannotCoverFees ? (
        <div className="mt-4">
          <InlineAlert tone="warning">
            Not enough SOL to cover network fees.
          </InlineAlert>
        </div>
      ) : null}

      {previewError ? (
        <div className="mt-4">
          <InlineAlert tone="error">
          <p>{previewError.message}</p>
          {previewError.code === "insufficient_balance_after_fee" &&
          previewError.maxSendableAmount ? (
            <p className="mt-1 text-sm">
              Maximum sendable amount is {previewError.maxSendableAmount} SOL.
            </p>
          ) : null}
          {showRefreshOnError ? (
            <button
              type="button"
              className="mt-2 text-sm font-medium underline"
              onClick={() => void handleRefreshBalance()}
              disabled={refreshMu.isPending}
            >
              {refreshMu.isPending ? "Refreshing…" : "Refresh balance"}
            </button>
          ) : null}
          </InlineAlert>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-surface-border bg-surface-elevated p-4">
          <div>
            <label className="mb-1 block text-xs text-content-muted">Network</label>
            <select
              className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm"
              value={network}
              onChange={(e) => {
                const n = e.target.value;
                setNetwork(n);
                setPreviewError(null);
                if (n === "solana") {
                  setSymbol("SOL");
                  setAssetType("native");
                }
                if (n === "ethereum") {
                  setSymbol("ETH");
                  setAssetType("native");
                }
                if (n === "bitcoin") {
                  setSymbol("BTC");
                  setAssetType("native");
                }
              }}
            >
              {walletSendSolanaEnabled() ? <option value="solana">Solana</option> : null}
              {walletSendEthereumEnabled() ? <option value="ethereum">Ethereum</option> : null}
              {walletSendBitcoinEnabled() ? <option value="bitcoin">Bitcoin</option> : null}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-content-muted">Asset</label>
            <select
              className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm"
              value={`${assetType}:${symbol}`}
              onChange={(e) => {
                const [at, sym] = e.target.value.split(":");
                setAssetType(at ?? "native");
                setPreviewError(null);
                if (at === "spl") setSymbol("SPL");
                else setSymbol(sym ?? "SOL");
              }}
            >
              {network === "solana" ? (
                <>
                  <option value="native:SOL">SOL</option>
                  {walletSendSplEnabled() ? <option value="spl:SPL">SPL token</option> : null}
                </>
              ) : null}
              {network === "ethereum" ? <option value="native:ETH">ETH</option> : null}
              {network === "bitcoin" ? <option value="native:BTC">BTC</option> : null}
            </select>
          </div>
          {(assetType === "spl" || assetType === "erc20") && (
            <div>
              <label className="mb-1 block text-xs text-content-muted">Token mint / contract</label>
              <input
                className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm font-mono"
                value={tokenMint}
                onChange={(e) => setTokenMint(e.target.value)}
                placeholder="Token mint or contract address"
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs text-content-muted">Recipient</label>
            <input
              className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm font-mono"
              value={toAddress}
              onChange={(e) => {
                setToAddress(e.target.value);
                setPreviewError(null);
              }}
              placeholder="Destination address"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-content-muted">Amount</label>
            <div className="flex gap-2">
              <input
                className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setPreviewError(null);
                }}
                placeholder="0.0"
              />
              {isSolNative && maxSendable ? (
                <button
                  type="button"
                  className="shrink-0 rounded-md border border-surface-border px-3 py-2 text-sm font-medium hover:bg-muted"
                  onClick={handleMaxAmount}
                >
                  Max
                </button>
              ) : null}
            </div>
            {balanceHint ? (
              <p className="mt-1 text-xs text-content-muted">Cached balance: {balanceHint}</p>
            ) : null}
            {isSolNative && maxSendable ? (
              <p className="mt-1 text-xs text-content-muted">
                Max sendable (after fees): {maxSendable} SOL
              </p>
            ) : null}
            {amountExceedsMax ? (
              <p className="mt-1 text-xs text-destructive">
                Amount exceeds maximum sendable after network fees.
              </p>
            ) : null}
          </div>
          <div>
            <label className="mb-1 block text-xs text-content-muted">Note (optional, local only)</label>
            <input
              className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Not submitted on-chain in this version"
            />
          </div>
          <button
            type="button"
            disabled={previewDisabled}
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:brightness-110 disabled:opacity-50"
            onClick={() => void runPreview()}
          >
            {previewMu.isPending ? "Previewing…" : "Preview transaction"}
          </button>
        </div>

        <div className="space-y-3 rounded-xl border border-surface-border bg-surface-elevated p-4">
          <h3 className="text-sm font-semibold">Fee preview</h3>
          {preview ? (
            <>
              <p className="text-sm text-content-muted">
                Est. fee: {preview.estimated_fee_amount} {preview.fee_symbol}
              </p>
              {preview.total_amount ? (
                <p className="text-sm text-content-muted">Total (incl. fee where applicable): {preview.total_amount}</p>
              ) : null}
              {preview.warnings?.length ? (
                <ul className="list-disc pl-5 text-xs text-amber-600">
                  {preview.warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              ) : null}
              <button
                type="button"
                className="rounded-md border border-destructive/50 px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setAcceptedRisk(false);
                  setConfirmOpen(true);
                }}
              >
                Continue to confirmation
              </button>
            </>
          ) : (
            <p className="text-sm text-content-muted">Run preview to see estimated network fees.</p>
          )}
        </div>
      </div>

      {confirmOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
          role="presentation"
          onClick={() => !confirmMu.isPending && setConfirmOpen(false)}
        >
          <div
            className="max-w-md rounded-lg border border-border bg-card p-6 shadow-xl"
            role="dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold">Confirm send</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Crypto transfers are irreversible. Confirm the address and network before sending.
            </p>
            <ul className="mt-3 space-y-1 text-sm">
              <li>
                <strong>Network:</strong> {network}
              </li>
              <li>
                <strong>Asset:</strong> {symbol} ({assetType})
              </li>
              <li className="break-all font-mono text-xs">
                <strong>To:</strong> {toAddress}
              </li>
              <li>
                <strong>Amount:</strong> {amount}
              </li>
              {preview ? (
                <li>
                  <strong>Est. fee:</strong> {preview.estimated_fee_amount} {preview.fee_symbol}
                </li>
              ) : null}
            </ul>
            <label className="mt-4 flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={acceptedRisk}
                onChange={(e) => setAcceptedRisk(e.target.checked)}
                className="mt-1"
              />
              <span>I understand this transaction cannot be reversed.</span>
            </label>
            {armSeconds > 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">Send unlocks in {armSeconds}s…</p>
            ) : null}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md px-3 py-1.5 text-sm"
                disabled={confirmMu.isPending}
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  !acceptedRisk || armSeconds > 0 || confirmMu.isPending || !preview
                }
                className="rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground hover:brightness-110 disabled:opacity-50"
                onClick={() => void runConfirm()}
              >
                {confirmMu.isPending ? "Sending…" : "Send now"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
