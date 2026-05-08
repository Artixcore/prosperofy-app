export function formatCurrency(value: number | null | undefined, currency = "USD"): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Not available";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function shortenAddress(value: string, visible = 4): string {
  if (!value) return "Not available";
  if (value.length <= visible * 2 + 3) return value;
  return `${value.slice(0, visible)}...${value.slice(-visible)}`;
}

export function formatChainName(chain: string | null | undefined): string {
  const normalized = (chain ?? "").toLowerCase().trim();
  if (!normalized) return "Unknown network";
  if (normalized === "solana") return "Solana";
  if (normalized === "ethereum") return "Ethereum";
  if (normalized === "bitcoin") return "Bitcoin";
  if (normalized === "spl") return "SPL";
  if (normalized === "erc20" || normalized === "erc-20") return "ERC-20";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function formatWalletProvider(provider: string | null | undefined): string {
  const normalized = (provider ?? "").toLowerCase().trim();
  if (!normalized) return "Wallet";
  if (normalized === "metamask") return "MetaMask";
  if (normalized === "phantom") return "Phantom";
  if (normalized === "wfl_internal") return "WFL Wallet";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

/**
 * "x seconds/minutes/hours ago" relative time, used for "Last synced" labels.
 * Returns "—" for null/invalid input so the UI never shows raw timestamps.
 */
export function formatRelativeTime(iso: string | null | undefined, now: Date = new Date()): string {
  if (!iso) return "—";
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "—";
  const diffMs = now.getTime() - then.getTime();
  if (diffMs < 0) return "just now";
  const sec = Math.floor(diffMs / 1000);
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return then.toLocaleDateString();
}
