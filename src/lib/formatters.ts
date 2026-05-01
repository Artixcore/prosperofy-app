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
