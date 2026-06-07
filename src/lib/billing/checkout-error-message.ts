import { isApiClientError } from "@/lib/api/errors";

const CHECKOUT_ERROR_MESSAGE =
  "We couldn't start checkout right now. Please try again.";

const CHECKOUT_ERROR_BY_CODE: Record<string, string> = {
  PAYMENT_PROVIDER_UNAVAILABLE: "Payment provider is temporarily unavailable.",
  PAYMENT_PROVIDER_NOT_CONFIGURED: "Billing is not configured yet.",
  PAYMENT_CREATE_FAILED: "We couldn't start checkout right now. Please try again.",
  BILLING_PLAN_NOT_FOUND: "This plan could not be found.",
  BILLING_CHECKOUT_FAILED: "We couldn't start checkout right now. Please try again.",
  UNAUTHENTICATED: "Please sign in again.",
};

/** Maps checkout API failures to user-facing messages. */
export function getCheckoutErrorMessage(error: unknown): string {
  if (isApiClientError(error)) {
    const mapped = CHECKOUT_ERROR_BY_CODE[error.code];
    if (mapped) return mapped;
    if (error.message.trim()) return error.message;
  }
  return CHECKOUT_ERROR_MESSAGE;
}
