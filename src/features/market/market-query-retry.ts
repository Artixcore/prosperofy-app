import { ApiClientError } from "@/lib/api/errors";

export function marketQueryRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 1) return false;

  if (error instanceof ApiClientError) {
    const status = error.status ?? 0;
    if ([400, 401, 403, 404, 422].includes(status)) return false;
    if ([500, 502, 503, 504].includes(status)) return true;
    if (error.retryable) return true;
  }

  return false;
}
