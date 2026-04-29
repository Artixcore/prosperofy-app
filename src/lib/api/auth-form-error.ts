import { isApiClientError } from "./errors";

/** User-visible message when server field errors were not mapped onto the form. */
export function resolveAuthFormCatchMessage(error: unknown, fallback: string): string {
  if (isApiClientError(error)) {
    if (error.status === 401) return "Invalid credentials. Please try again.";
    if (error.status === 419) return "Unable to connect. Please try again.";
    if (error.code === "NETWORK_ERROR" || error.status === 0) {
      return "Unable to connect. Please try again.";
    }
    return error.message;
  }
  return fallback;
}

export function logAuthFormErrorInDevelopment(error: unknown): void {
  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }
}
