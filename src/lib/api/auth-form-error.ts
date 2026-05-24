import { displayApiError } from "./display-api-error";
import { isApiClientError } from "./errors";

/** User-facing auth form error (login/register). */
export function resolveAuthFormCatchMessage(error: unknown, fallback = "Sign in failed. Please try again."): string {
  if (!isApiClientError(error)) {
    return fallback;
  }
  return displayApiError(error, "auth-form").message;
}

export function logAuthFormErrorInDevelopment(error: unknown): void {
  if (process.env.NODE_ENV === "development") {
    if (isApiClientError(error)) {
      console.warn("[auth-form]", {
        status: error.status,
        code: error.code,
        requestId: error.requestId,
        correlationId: error.correlationId,
      });
      return;
    }
    console.warn("[auth-form]", { type: "unexpected_error" });
  }
}
