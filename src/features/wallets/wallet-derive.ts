import type { WalletOverview } from "@/lib/api/types";

/**
 * Normalised view of the WFL wallet derived from the wallet overview payload.
 * Used by every component on the wallet dashboard so we have a single source
 * of truth for the four UI states.
 */
export type WflWalletState = {
  /** True when a row exists with a known status (active/pending/failed). */
  exists: boolean;
  status: "active" | "pending" | "failed" | "missing";
  addresses: {
    solana: string | null;
    ethereum: string | null;
    bitcoin: string | null;
  };
};

const KNOWN_STATUSES = new Set<WflWalletState["status"]>([
  "active",
  "pending",
  "failed",
]);

/**
 * Derives the {@link WflWalletState} from the overview payload. Treats unknown
 * backend status strings as "pending" to avoid false-positive failure UI.
 */
export function wflWalletState(
  overview: WalletOverview | null | undefined,
): WflWalletState {
  const wallet = overview?.wfl_wallet ?? null;
  if (!wallet) {
    return {
      exists: false,
      status: "missing",
      addresses: { solana: null, ethereum: null, bitcoin: null },
    };
  }

  const raw = (wallet.status ?? "").toLowerCase();
  const status: WflWalletState["status"] = KNOWN_STATUSES.has(
    raw as WflWalletState["status"],
  )
    ? (raw as WflWalletState["status"])
    : "pending";

  return {
    exists: true,
    status,
    addresses: {
      solana: wallet.public_solana_address ?? null,
      ethereum: wallet.public_ethereum_address ?? null,
      bitcoin: wallet.public_bitcoin_address ?? null,
    },
  };
}

/**
 * The wallet page should surface "Activate WFL Wallet" only when there is no
 * row at all, or when the previous provisioning attempt terminally failed.
 * Pending rows should never show the repair CTA — they show a "being prepared"
 * banner instead.
 */
export function shouldShowActivateWfl(
  overview: WalletOverview | null | undefined,
): boolean {
  const state = wflWalletState(overview);
  return state.status === "missing" || state.status === "failed";
}

/**
 * Send is only enabled for an active WFL wallet. Pending/failed/missing states
 * disable the Send CTA and surface explanatory copy.
 */
export function shouldEnableSend(
  overview: WalletOverview | null | undefined,
): boolean {
  return wflWalletState(overview).status === "active";
}

/**
 * Picks the public address to show on the balance card. We prefer Solana
 * (primary network), then Ethereum, then Bitcoin so the user always sees a
 * concrete address as soon as one is available.
 */
export function primaryWalletAddress(
  overview: WalletOverview | null | undefined,
): { network: "solana" | "ethereum" | "bitcoin"; address: string } | null {
  const { addresses } = wflWalletState(overview);
  if (addresses.solana) return { network: "solana", address: addresses.solana };
  if (addresses.ethereum) return { network: "ethereum", address: addresses.ethereum };
  if (addresses.bitcoin) return { network: "bitcoin", address: addresses.bitcoin };
  return null;
}
