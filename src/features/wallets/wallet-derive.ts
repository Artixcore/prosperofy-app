import type { ConnectedWallet, WalletOverview } from "@/lib/api/types";

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
 * Returns the most-recently verified Phantom wallet for the user, or null if
 * none are connected. Multiple Phantom wallets per user collapse to the
 * latest; older addresses remain manageable on /wallet/settings.
 */
export function phantomWallet(
  overview: WalletOverview | null | undefined,
): ConnectedWallet | null {
  return mostRecentByProvider(overview, "phantom");
}

/**
 * Returns the most-recently verified MetaMask wallet for the user, or null.
 */
export function metaMaskWallet(
  overview: WalletOverview | null | undefined,
): ConnectedWallet | null {
  return mostRecentByProvider(overview, "metamask");
}

export function isPhantomConnected(
  overview: WalletOverview | null | undefined,
): boolean {
  return phantomWallet(overview) !== null;
}

export function isMetaMaskConnected(
  overview: WalletOverview | null | undefined,
): boolean {
  return metaMaskWallet(overview) !== null;
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

function mostRecentByProvider(
  overview: WalletOverview | null | undefined,
  provider: "phantom" | "metamask",
): ConnectedWallet | null {
  const list = overview?.connected_wallets ?? [];
  const matches = list.filter(
    (w) => (w.provider ?? "").toLowerCase() === provider,
  );
  if (matches.length === 0) return null;

  return matches.reduce<ConnectedWallet>((best, current) => {
    const bestAt = parseTimestamp(best.last_verified_at);
    const currentAt = parseTimestamp(current.last_verified_at);
    return currentAt > bestAt ? current : best;
  }, matches[0]);
}

function parseTimestamp(value: string | null): number {
  if (!value) return 0;
  const n = Date.parse(value);
  return Number.isNaN(n) ? 0 : n;
}
