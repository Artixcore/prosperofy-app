import { ApiClientError } from "@/lib/api/errors";

export function isMarketRetryableError(error: unknown): boolean {
  if (error instanceof ApiClientError) {
    if (error.retryable) return true;
    return [500, 502, 503, 504].includes(error.status ?? 0);
  }
  return false;
}
