import { isApiClientError } from "./errors";

/** User-visible message when server field errors were not mapped onto the form. */
export function resolveAuthFormCatchMessage(error: unknown, fallback: string): string {
  if (isApiClientError(error)) {
    return error.message;
  }
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }
  return fallback;
}

export function logAuthFormErrorInDevelopment(error: unknown): void {
  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }
}
