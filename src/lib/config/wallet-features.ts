/**
 * UI feature flags for WFL send/receive. Must mirror Laravel `WALLET_SEND_*` and wallet-service flags.
 * Never put secrets or internal service URLs here.
 */
export function walletSendSolanaEnabled(): boolean {
  return process.env.NEXT_PUBLIC_WALLET_SEND_SOLANA_ENABLED !== "false";
}

export function walletSendSplEnabled(): boolean {
  return (
    walletSendSolanaEnabled() &&
    process.env.NEXT_PUBLIC_WALLET_SEND_SPL_ENABLED === "true"
  );
}

export function walletSendEthereumEnabled(): boolean {
  return process.env.NEXT_PUBLIC_WALLET_SEND_ETHEREUM_ENABLED === "true";
}

export function walletSendBitcoinEnabled(): boolean {
  return process.env.NEXT_PUBLIC_WALLET_SEND_BITCOIN_ENABLED === "true";
}

export function walletSendErc20Enabled(): boolean {
  return process.env.NEXT_PUBLIC_WALLET_SEND_ERC20_ENABLED === "true";
}

export function walletSendRequirePassphrase(): boolean {
  return process.env.NEXT_PUBLIC_WALLET_SEND_REQUIRE_PASSPHRASE === "true";
}

export function walletSendRequireTwoFactor(): boolean {
  return process.env.NEXT_PUBLIC_WALLET_SEND_REQUIRE_2FA === "true";
}
