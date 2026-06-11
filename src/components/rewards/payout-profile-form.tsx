"use client";

import { useEffect, useState } from "react";
import { InlineAlert } from "@/components/system/inline-alert";
import { usePayoutProfile, useSavePayoutProfile } from "@/features/rewards/use-payout-profile";
import { LoadingState } from "@/components/system/loading-state";

export function PayoutProfileForm() {
  const profile = usePayoutProfile();
  const save = useSavePayoutProfile();
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    if (profile.data?.has_profile) {
      setWalletAddress("");
    }
  }, [profile.data?.has_profile]);

  if (profile.isPending) {
    return <LoadingState label="Loading payout profile…" />;
  }

  const data = profile.data;
  const currency = data?.payout_currency ?? "usdttrc20";
  const network = data?.network ?? "trc20";

  return (
    <section className="rounded-xl border border-surface-border bg-surface-raised p-5">
      <h2 className="text-sm font-semibold text-content-primary">Crypto payout profile</h2>
      <p className="mt-1 text-sm text-content-muted">
        Rewards are paid in {currency.toUpperCase()} on {network.toUpperCase()}. Only you can update this
        wallet. Payouts are initiated by Prosperofy operators — never from this screen.
      </p>
      {data?.has_profile ? (
        <p className="mt-3 text-sm text-content-primary">
          Saved wallet: <span className="font-mono">{data.wallet_address_masked}</span>
          {data.status ? <span className="ml-2 text-content-muted">({data.status})</span> : null}
        </p>
      ) : null}
      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate({ wallet_address: walletAddress.trim(), payout_currency: currency });
        }}
      >
        <label className="block text-sm">
          <span className="font-medium text-content-primary">Wallet address</span>
          <input
            type="text"
            className="mt-1 w-full rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="Enter your USDT TRC20 address"
            autoComplete="off"
            required
          />
        </label>
        <p className="text-xs text-amber-600 dark:text-amber-300">
          Verify the address carefully. Incorrect wallets may result in permanent loss of funds.
        </p>
        {save.isError ? (
          <InlineAlert tone="error">
            {save.error instanceof Error ? save.error.message : "Could not save payout profile."}
          </InlineAlert>
        ) : null}
        {save.isSuccess ? <InlineAlert tone="success">Payout profile saved.</InlineAlert> : null}
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          disabled={save.isPending || walletAddress.trim().length < 10}
        >
          {save.isPending ? "Saving…" : data?.has_profile ? "Update wallet" : "Save wallet"}
        </button>
      </form>
    </section>
  );
}
