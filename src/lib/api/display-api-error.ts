import { ERROR_MESSAGES } from "./error-catalog";
import { getApiErrorData, isApiClientError, type FieldErrors } from "./errors";

export type NewsPanelKind = "crypto" | "market";

export type ApiErrorContext =
  | "default"
  | "wallet-send"
  | "wallet-send-confirm"
  | "wallet-refresh"
  | "auth-form"
  | "settings"
  | "news"
  | "market"
  | "agents"
  | "signals";

export type DisplayApiErrorResult = {
  message: string;
  code: string | null;
  retryable: boolean;
  fieldErrors: FieldErrors;
  data: Record<string, unknown> | null;
  hints: string[];
  showRefreshBalance: boolean;
};

function firstFieldError(fieldErrors: FieldErrors): string | null {
  for (const msgs of Object.values(fieldErrors)) {
    if (Array.isArray(msgs) && msgs.length > 0 && typeof msgs[0] === "string") {
      return msgs[0];
    }
  }
  return null;
}

function walletExtensionMessage(error: unknown): string | null {
  if (!(error instanceof Error) || !error.message) {
    return null;
  }
  const m = error.message;
  if (m === "Wallet signing was cancelled.") return m;
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
  return null;
}

function lookupMessage(code: string, fallback?: string): string {
  return ERROR_MESSAGES[code] ?? fallback ?? ERROR_MESSAGES.SERVER_ERROR ?? "We could not process your request. Please try again.";
}

function buildHints(code: string | null, data: Record<string, unknown> | null): string[] {
  const hints: string[] = [];
  if (code === "WALLET_INSUFFICIENT_BALANCE_AFTER_FEE" && data) {
    const max = data.max_sendable_amount;
    if (typeof max === "string" && max.trim()) {
      hints.push(`Maximum sendable amount is ${max} SOL.`);
    }
  }
  return hints;
}

function resolveApiClientError(
  error: import("./errors").ApiClientError,
  context: ApiErrorContext,
): DisplayApiErrorResult {
  const code = error.code;
  const data = getApiErrorData(error);
  const fieldFirst = firstFieldError(error.fieldErrors);

  if (code === "VALIDATION_ERROR") {
    const validationDefault =
      context === "auth-form"
        ? "Please check your details and try again."
        : context === "settings"
          ? "Please check your settings and try again."
          : "Validation failed.";
    return {
      message: fieldFirst ?? lookupMessage(code, validationDefault),
      code,
      retryable: error.retryable,
      fieldErrors: error.fieldErrors,
      data,
      hints: [],
      showRefreshBalance: false,
    };
  }

  if (context === "auth-form" && error.status === 401) {
    return {
      message: "Invalid credentials. Please try again.",
      code,
      retryable: false,
      fieldErrors: error.fieldErrors,
      data,
      hints: [],
      showRefreshBalance: false,
    };
  }

  if (error.status === 0 && error.code === "NETWORK_ERROR") {
    const networkMessage =
      context === "wallet-send"
        ? "Send preview is temporarily unavailable. Please try again shortly."
        : context === "wallet-refresh"
          ? "Unable to reach the server. Check your connection and try again."
          : "Unable to connect. Please check your connection and try again.";
    return {
      message: networkMessage,
      code,
      retryable: true,
      fieldErrors: error.fieldErrors,
      data,
      hints: [],
      showRefreshBalance: false,
    };
  }

  if (error.status === 0 && error.code === "TIMEOUT") {
    const timeoutMessage =
      context === "wallet-send-confirm"
        ? "Send confirmation timed out. Please check wallet history before retrying."
        : context === "wallet-send"
          ? "Send preview timed out. Please try again shortly."
          : "The request timed out. Please try again shortly.";
    return {
      message: timeoutMessage,
      code,
      retryable: context !== "wallet-send-confirm",
      fieldErrors: error.fieldErrors,
      data,
      hints: [],
      showRefreshBalance: false,
    };
  }

  if (context === "wallet-send-confirm") {
    if (error.status === 504) {
      return {
        message:
          "Send confirmation timed out. Please check wallet history before retrying.",
        code,
        retryable: false,
        fieldErrors: error.fieldErrors,
        data,
        hints: [],
        showRefreshBalance: false,
      };
    }
    if (
      error.status === 503 ||
      code === "WALLET_RPC_TIMEOUT" ||
      code === "WALLET_UNAVAILABLE" ||
      code === "WALLET_UPSTREAM_UNAVAILABLE"
    ) {
      return {
        message: "Blockchain network is temporarily unavailable. Please try again shortly.",
        code,
        retryable: error.retryable,
        fieldErrors: error.fieldErrors,
        data,
        hints: [],
        showRefreshBalance: false,
      };
    }
    if (error.status === 401 || code === "AUTH_UNAUTHENTICATED") {
      return {
        message: "Session expired. Please sign in again.",
        code,
        retryable: false,
        fieldErrors: error.fieldErrors,
        data,
        hints: [],
        showRefreshBalance: false,
      };
    }
    if (error.status === 422 || code === "VALIDATION_ERROR") {
      const fieldFirst = firstFieldError(error.fieldErrors);
      return {
        message: fieldFirst ?? lookupMessage(code, "Some fields need your attention."),
        code,
        retryable: false,
        fieldErrors: error.fieldErrors,
        data,
        hints: [],
        showRefreshBalance: false,
      };
    }
  }

  if (context === "news" && (code === "NEWS_DATA_UNAVAILABLE" || error.status >= 500 || error.status === 0)) {
    return {
      message: lookupMessage("NEWS_DATA_UNAVAILABLE"),
      code: code === "NEWS_DATA_UNAVAILABLE" ? code : "NEWS_DATA_UNAVAILABLE",
      retryable: error.retryable,
      fieldErrors: error.fieldErrors,
      data,
      hints: [],
      showRefreshBalance: false,
    };
  }

  if (context === "agents" && (error.status >= 500 || code === "AGENTS_LOAD_FAILED")) {
    return {
      message: "Agent data could not be loaded. Please try again shortly.",
      code,
      retryable: error.retryable,
      fieldErrors: error.fieldErrors,
      data,
      hints: [],
      showRefreshBalance: false,
    };
  }

  if (
    context === "signals" &&
    (code === "SIGNAL_PERSIST_FAILED" ||
      code === "AI_BUSINESS_ERROR" ||
      code === "AI_ERROR" ||
      code === "AI_NOT_CONFIGURED" ||
      error.status === 503 ||
      error.status === 504)
  ) {
    return {
      message: "The agent could not generate a signal right now. Please try again shortly.",
      code,
      retryable: error.retryable,
      fieldErrors: error.fieldErrors,
      data,
      hints: [],
      showRefreshBalance: false,
    };
  }

  if (context === "market" && (code === "MARKET_UNAVAILABLE" || error.status === 503 || error.status === 504)) {
    return {
      message: lookupMessage("MARKET_UNAVAILABLE"),
      code,
      retryable: error.retryable,
      fieldErrors: error.fieldErrors,
      data,
      hints: [],
      showRefreshBalance: false,
    };
  }

  const catalogMessage = ERROR_MESSAGES[code];
  const message =
    catalogMessage ?? messageFromStatus(error.status, context) ?? lookupMessage("SERVER_ERROR");

  const showRefreshBalance =
    code === "WALLET_BALANCE_NOT_SYNCED" || code === "WALLET_BALANCE_STALE";

  return {
    message,
    code,
    retryable: error.retryable,
    fieldErrors: error.fieldErrors,
    data,
    hints: buildHints(code, data),
    showRefreshBalance,
  };
}

function messageFromStatus(status: number, context: ApiErrorContext): string | null {
  if (status === 401 && context !== "auth-form") {
    return lookupMessage("AUTH_UNAUTHENTICATED");
  }
  if (status === 403) {
    return lookupMessage("AUTH_FORBIDDEN");
  }
  if (status === 404) {
    return lookupMessage("HTTP_NOT_FOUND");
  }
  if (status === 429) {
    return lookupMessage("HTTP_RATE_LIMIT");
  }
  if (status >= 500) {
    return lookupMessage("SERVER_ERROR");
  }
  return null;
}

export function displayApiError(
  error: unknown,
  context: ApiErrorContext = "default",
): DisplayApiErrorResult {
  if (context === "settings" && error instanceof TypeError) {
    return {
      message: "Network connection failed. Please check your connection and try again.",
      code: "NETWORK_ERROR",
      retryable: true,
      fieldErrors: {},
      data: null,
      hints: [],
      showRefreshBalance: false,
    };
  }

  const extension = walletExtensionMessage(error);
  if (extension) {
    return {
      message: extension,
      code: null,
      retryable: false,
      fieldErrors: {},
      data: null,
      hints: [],
      showRefreshBalance: false,
    };
  }

  if (!isApiClientError(error)) {
    return {
      message: "We could not process your request. Please try again.",
      code: null,
      retryable: false,
      fieldErrors: {},
      data: null,
      hints: [],
      showRefreshBalance: false,
    };
  }

  return resolveApiClientError(error, context);
}

/** Backward-compatible string helper. */
export function normalizeApiError(error: unknown, context?: ApiErrorContext): string {
  return displayApiError(error, context).message;
}

export function normalizeNewsPanelError(panel: "crypto" | "market", error: unknown): string {
  const base = displayApiError(error, "news").message;
  if (!isApiClientError(error)) {
    return panel === "crypto" ? "Crypto news could not be loaded." : "Market news could not be loaded.";
  }
  if (error.code === "NEWS_DATA_UNAVAILABLE" || error.status >= 500 || error.status === 0) {
    return base;
  }
  return panel === "crypto" ? "Crypto news could not be loaded." : "Market news could not be loaded.";
}

export function normalizeAgentDashboardError(error: unknown): string {
  return displayApiError(error, "agents").message;
}

export function normalizeSignalGenerateError(error: unknown): string {
  return displayApiError(error, "signals").message;
}

export function normalizeMarketDataError(error: unknown): string {
  return displayApiError(error, "market").message;
}
