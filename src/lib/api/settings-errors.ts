import { isApiClientError } from "@/lib/api/errors";

export function friendlySettingsError(error: unknown): string {
  if (isApiClientError(error)) {
    const { status, code, message } = error;
    if (status === 401) return "Your session expired. Please log in again.";
    if (status === 403) return "You do not have permission to perform this action.";
    if (status === 429) return "Too many attempts. Please wait and try again.";
    if (status === 503) return "The server could not complete the request. Please try again shortly.";
    if (status >= 500) return "The server could not complete the request. Please try again shortly.";
    if (code === "INVALID_PASSWORD") return "Current password is incorrect.";
    if (code === "INVALID_PASSPHRASE") return "That passphrase is incorrect.";
    if (code === "VERIFICATION_FAILED") {
      return "We could not verify your identity. Please check your password, passphrase, or authentication code.";
    }
    if (code === "EXCHANGE_VERIFY_FAILED" && message.trim()) return message;
    if (message.trim()) return message;
  }
  if (
    error instanceof TypeError ||
    (error instanceof Error && /network|fetch/i.test(error.message))
  ) {
    return "Network connection failed. Please check your internet and try again.";
  }
  return "Settings could not be loaded. Please try again.";
}
