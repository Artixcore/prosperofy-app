import { isApiClientError, type FieldErrors } from "./errors";

function firstFieldError(fieldErrors: FieldErrors): string | null {
  for (const msgs of Object.values(fieldErrors)) {
    if (Array.isArray(msgs) && msgs.length > 0 && typeof msgs[0] === "string") {
      return msgs[0];
    }
  }
  return null;
}

export function normalizeApiError(error: unknown): string {
  if (error instanceof Error && error.message === "Wallet signing was cancelled.") {
    return "Wallet signing was cancelled.";
  }

  if (!isApiClientError(error)) {
    if (error instanceof Error && error.message) {
      const m = error.message;
      if (m.includes("Phantom not available")) {
        return "Phantom is not installed. Please install Phantom and try again.";
      }
      if (m.includes("MetaMask not available")) {
        return "MetaMask is not installed. Please install MetaMask and try again.";
      }
      if (m.includes("Could not read Phantom public key")) {
        return "Could not read Phantom public key. Please try again.";
      }
      if (m.includes("No Ethereum account")) {
        return "No Ethereum account available. Please unlock MetaMask and try again.";
      }
      if (m.includes("Unexpected signature format")) {
        return "Unexpected signature format from wallet. Please try again.";
      }
      if (m.includes("Wallet service did not return")) {
        return "Wallet connection failed. Please try again.";
      }
      if (m.includes("Wallet connection challenge expired")) {
        return "Wallet connection challenge expired. Please try again.";
      }
      if (m.includes("Wallet account changed during connection")) {
        return "Wallet account changed during connection. Please try again.";
      }
    }
    return "We could not process your request. Please try again.";
  }

  if (error.status === 0 && error.code === "NETWORK_ERROR") {
    return "Send preview is temporarily unavailable. Please try again shortly.";
  }
  if (error.status === 0 && error.code === "TIMEOUT") {
    return "Send preview timed out. Please try again shortly.";
  }
  if (error.status === 401) {
    return "Your session expired. Please log in again.";
  }
  if (error.status === 419 || error.code === "HTTP_SESSION_EXPIRED") {
    return "Your session expired. Please refresh and try again.";
  }
  if (error.status === 403) {
    return "You do not have permission to perform this action.";
  }
  // Balance-refresh and wallet-sync upstream/state errors emitted by Laravel.
  // Match by code first so the wording is precise regardless of HTTP status.
  if (error.code === "WALLET_UPSTREAM_UNAVAILABLE") {
    return "Solana network data is temporarily unavailable. Please try again shortly.";
  }
  if (error.code === "WALLET_SYNC_FAILED") {
    return "Wallet balance service is temporarily unavailable. Please try again shortly.";
  }
  if (error.code === "WALLET_ADDRESS_MISSING") {
    return "Solana receive address is not available for this wallet.";
  }
  if (error.code === "WALLET_INVALID_ADDRESS") {
    return "The wallet address could not be validated.";
  }
  if (error.code === "WALLET_NOT_FOUND") {
    return "No WFL Wallet found. Please activate your wallet first.";
  }
  if (error.code === "BALANCE_NOT_SYNCED") {
    return "Please refresh your wallet balance before sending.";
  }
  if (error.code === "INSUFFICIENT_BALANCE") {
    return "Insufficient SOL balance for this transaction.";
  }
  if (error.code === "WALLET_NOT_ACTIVE") {
    return "Your WFL Wallet is not active yet. Please try again shortly.";
  }
  if (error.code === "WALLET_RATE_LIMIT") {
    return "Too many balance refreshes. Please try again in a moment.";
  }
  if (error.status === 404) {
    return "The requested item could not be found.";
  }
  if (error.status === 409 && error.code === "WALLET_ALREADY_LINKED") {
    return "This wallet is already linked to another account.";
  }
  if (error.status === 409 && error.code === "PREVIEW_CONSUMED") {
    return "This preview can no longer be used.";
  }
  if (error.status === 410 || error.code === "PREVIEW_EXPIRED") {
    return "Transaction preview expired. Please create a new preview.";
  }
  if (error.status === 422) {
    switch (error.code) {
      case "WALLET_CHALLENGE_INVALID":
        return "This wallet connection expired. Please reconnect your wallet and try again.";
      case "WALLET_CHALLENGE_NOT_FOUND":
        return "This wallet connection request was not found. Please reconnect your wallet.";
      case "WALLET_CHALLENGE_EXPIRED":
        return "This wallet connection request expired. Please reconnect your wallet.";
      case "WALLET_CHALLENGE_USED":
        return "This wallet connection request was already used. Please start again.";
      case "WALLET_CHALLENGE_MESSAGE_MISMATCH":
        return "This wallet connection request could not be validated. Please reconnect your wallet.";
      case "WALLET_PROVIDER_MISMATCH":
      case "WALLET_CHAIN_MISMATCH":
        return "Wallet provider mismatch. Please reconnect your wallet.";
      case "WALLET_ADDRESS_MISMATCH":
        return "Wallet address changed during connection. Please reconnect your wallet.";
      case "WALLET_CHALLENGE_RACE":
        return "This wallet connection request could not be completed. Please try again.";
      case "WALLET_VERIFY_FAILED":
        return "Wallet signature verification failed. Please try again.";
      case "VALIDATION_ERROR":
        return (
          firstFieldError(error.fieldErrors) ??
          "Wallet connection details are incomplete. Please reconnect your wallet."
        );
      default:
        return (
          error.message ||
          "Wallet connection details are incomplete. Please reconnect your wallet."
        );
    }
  }
  if (error.status === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }
  if (error.status === 504) {
    return "The request timed out. Please try again shortly.";
  }
  if (error.code === "AI_NOT_CONFIGURED") {
    return "AI analysis is not available right now. Please try again later.";
  }
  if (error.code === "AI_UNAVAILABLE" || error.code === "AI_ERROR") {
    return "AI analysis is temporarily unavailable. Please try again shortly.";
  }
  if (error.code === "SIGNAL_PERSIST_FAILED") {
    return "The agent could not generate a signal right now. Please try again shortly.";
  }
  if (error.code === "AI_BUSINESS_ERROR") {
    return "AI could not complete this request. Please adjust your inputs and try again.";
  }
  if (error.code === "MARKET_UNAVAILABLE") {
    return "Market data is temporarily unavailable. Showing cached data if available.";
  }
  if (
    error.code === "news_data_unavailable" ||
    error.code === "NEWS_UNAVAILABLE"
  ) {
    return "News data is temporarily unavailable.";
  }
  if (
    error.status === 503 ||
    error.code === "WALLET_UNAVAILABLE" ||
    error.code === "wallet_error"
  ) {
    return "Send preview is temporarily unavailable. Please try again shortly.";
  }

  if (error.status >= 500) {
    return "The server could not complete your request. Please try again shortly.";
  }
  return error.message || "We could not process your request. Please try again.";
}

/** User-facing message when agent dashboard data fails to load. */
export function normalizeAgentDashboardError(error: unknown): string {
  if (!isApiClientError(error)) {
    return "Agent data could not be loaded. Please try again shortly.";
  }
  if (error.status === 401) {
    return normalizeApiError(error);
  }
  return "Agent data could not be loaded. Please try again shortly.";
}

/** User-facing message when standalone signal generation fails. */
export function normalizeSignalGenerateError(error: unknown): string {
  if (!isApiClientError(error)) {
    return "The agent could not generate a signal right now. Please try again shortly.";
  }
  if (
    error.code === "SIGNAL_PERSIST_FAILED" ||
    error.code === "AI_BUSINESS_ERROR" ||
    error.code === "AI_UNAVAILABLE" ||
    error.code === "AI_ERROR" ||
    error.code === "AI_NOT_CONFIGURED" ||
    error.status === 503 ||
    error.status === 504
  ) {
    return "The agent could not generate a signal right now. Please try again shortly.";
  }
  return normalizeApiError(error);
}

/** User-facing message when market quote/candle data is unavailable. */
export function normalizeMarketDataError(error: unknown): string {
  if (!isApiClientError(error)) {
    return "Market data is temporarily unavailable. Showing cached data if available.";
  }
  if (error.code === "MARKET_UNAVAILABLE" || error.status === 503 || error.status === 504) {
    return "Market data is temporarily unavailable. Showing cached data if available.";
  }
  return normalizeApiError(error);
}
