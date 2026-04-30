import { isApiClientError } from "./errors";

/** User-visible message when server field errors were not mapped onto the form. */
export function resolveAuthFormCatchMessage(error: unknown, fallback: string): string {
  if (isApiClientError(error)) {
    if (error.status === 401) return "Invalid credentials. Please try again.";
    if (error.status === 419) return "Session expired. Please refresh and try again.";
    if (error.code === "NETWORK_ERROR" || error.status === 0) {
      return "Connection error. Please try again.";
    }
    return error.message;
  }
  return fallback;
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
