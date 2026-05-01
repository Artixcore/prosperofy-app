import { isApiClientError } from "@/lib/api/errors";
import { normalizeApiError } from "@/lib/api/normalize-api-error";

type Props = {
  error: unknown;
  onRetry?: () => void;
  title?: string;
};

export function ErrorState({ error, onRetry, title = "Something went wrong" }: Props) {
  const message = normalizeApiError(error);
  const code = isApiClientError(error) ? error.code : undefined;
  const requestId = isApiClientError(error) ? error.requestId : undefined;
  const correlationId = isApiClientError(error) ? error.correlationId : undefined;
  const canRetry = isApiClientError(error) ? error.retryable : Boolean(onRetry);

  return (
    <div
      className="rounded-xl border border-red-300/70 bg-red-50 p-4 text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-100"
      role="alert"
    >
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-red-700 dark:text-red-200/90">{message}</p>
      {code ? (
        <p className="mt-2 font-mono text-xs text-red-700/90 dark:text-red-300/80">Code: {code}</p>
      ) : null}
      {requestId ? (
        <p className="mt-1 font-mono text-xs text-red-700/80 dark:text-red-300/70">Request ID: {requestId}</p>
      ) : null}
      {correlationId ? (
        <p className="mt-1 font-mono text-xs text-red-700/80 dark:text-red-300/70">Correlation ID: {correlationId}</p>
      ) : null}
      {onRetry && canRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-md bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600 dark:bg-red-900/60 dark:hover:bg-red-800/80"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
