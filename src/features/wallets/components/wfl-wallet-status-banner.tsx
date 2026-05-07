"use client";

import { Loader2, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { InlineAlert } from "@/components/system/inline-alert";
import { useToast } from "@/components/system/toast-context";
import { useCreateWflWalletMutation } from "@/features/wallets/use-wallet-mutations";
import { wflWalletState } from "@/features/wallets/wallet-derive";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import type { WalletOverview } from "@/lib/api/types";

type Props = {
  overview: WalletOverview | null | undefined;
};

/**
 * Surface the lifecycle of the WFL wallet at the top of the dashboard.
 *
 *  - missing/failed → repair CTA ("Activate WFL Wallet").
 *  - pending        → "being prepared" reassurance with no CTA (backend retries).
 *  - active         → renders nothing (the balance card carries the success state).
 *
 * Never displays raw backend errors; failures map through `normalizeApiError`.
 */
export function WflWalletStatusBanner({ overview }: Props) {
  const state = wflWalletState(overview);
  const create = useCreateWflWalletMutation();
  const { pushToast } = useToast();
  const [error, setError] = useState<string | null>(null);

  if (state.status === "active") return null;

  if (state.status === "pending") {
    return (
      <InlineAlert tone="info">
        <div className="flex items-start gap-2">
          <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin" aria-hidden />
          <div>
            <p className="font-medium">Your WFL Wallet is being prepared.</p>
            <p className="mt-0.5 text-xs opacity-80">
              This usually takes a few moments. Refresh this page to check progress.
            </p>
          </div>
        </div>
      </InlineAlert>
    );
  }

  async function handleActivate() {
    setError(null);
    try {
      await create.mutateAsync();
      pushToast({
        tone: "success",
        title: "WFL Wallet setup queued",
        description: "We're preparing your wallet now. Refresh to see updates.",
      });
    } catch (e) {
      setError(normalizeApiError(e));
    }
  }

  const isFailed = state.status === "failed";

  return (
    <div className="space-y-3">
      <div
        className="flex flex-col gap-3 rounded-xl border border-amber-300/70 bg-amber-50 p-4 text-amber-950 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900/55 dark:bg-amber-950/35 dark:text-amber-50"
        role="status"
      >
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">
              {isFailed
                ? "WFL Wallet setup failed."
                : "Your WFL Wallet is not active yet."}
            </p>
            <p className="mt-0.5 text-sm opacity-90">
              {isFailed
                ? "We couldn't finish preparing your wallet. Try activating it again."
                : "Activate your WFL Wallet to send, receive, and view balances."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void handleActivate()}
          disabled={create.isPending}
          className="self-start rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm motion-safe:transition-[filter] hover:brightness-110 disabled:opacity-60 sm:self-auto"
        >
          {create.isPending ? "Activating…" : "Activate WFL Wallet"}
        </button>
      </div>
      {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
    </div>
  );
}
