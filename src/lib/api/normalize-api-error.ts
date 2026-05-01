import { isApiClientError } from "./errors";

export function normalizeApiError(error: unknown): string {
  if (!isApiClientError(error)) {
    return "We could not process your request. Please try again.";
  }

  if (error.status === 0 && error.code === "NETWORK_ERROR") {
    return "Network connection failed. Please check your internet and try again.";
  }
  if (error.status === 0 && error.code === "TIMEOUT") {
    return "The server took too long to respond. Please try again.";
  }
  if (error.status === 401) {
    return "Your session expired. Please log in again.";
  }
  if (error.status === 403) {
    return "You do not have permission to perform this action.";
  }
  if (error.status === 404) {
    return "The requested item could not be found.";
  }
  if (error.status === 422) {
    return "Some fields need your attention. Please review and try again.";
  }
  if (error.status === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }
  if (error.status >= 500) {
    return "The server could not complete your request. Please try again shortly.";
  }
  return error.message || "We could not process your request. Please try again.";
}
