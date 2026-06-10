import { isApiClientError } from "@/lib/api/errors";

const CARD_CHECKOUT_ERROR_MESSAGE =
  "We could not start card payment right now. Please try again.";

const CARD_CHECKOUT_ERROR_BY_CODE: Record<string, string> = {
  CARD_FEATURE_DISABLED: "Prosperity Card is not available right now.",
  CARD_MEMBERSHIP_INELIGIBLE:
    "Your current membership does not include Prosperity Card access.",
  CARD_SPEND_WALLET_NOT_READY:
    "Your Spend Wallet must be ready before card activation.",
  CARD_ALREADY_ACTIVE: "Your Prosperity Card is already active.",
  PAYMENT_PROVIDER_UNAVAILABLE: "Payment provider is not configured yet.",
  PAYMENT_CREATE_FAILED: CARD_CHECKOUT_ERROR_MESSAGE,
  CARD_CHECKOUT_FAILED: CARD_CHECKOUT_ERROR_MESSAGE,
  UNAUTHENTICATED: "Please sign in again.",
};

export function getCardCheckoutErrorMessage(error: unknown): string {
  if (isApiClientError(error)) {
    const mapped = CARD_CHECKOUT_ERROR_BY_CODE[error.code];
    if (mapped) return mapped;
    if (error.message.trim()) return error.message;
  }
  return CARD_CHECKOUT_ERROR_MESSAGE;
}
