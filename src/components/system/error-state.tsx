import { isApiClientError } from "@/lib/api/errors";

type Props = {
  error: unknown;
  onRetry?: () => void;
  title?: string;
};

export function ErrorState({ error, onRetry, title = "Something went wrong" }: Props) {
  const message = isApiClientError(error)
    ? error.message
    : "An unexpected error occurred. Please try again.";
  const code = isApiClientError(error) ? error.code : undefined;
  const canRetry = isApiClientError(error) ? error.retryable : Boolean(onRetry);

  return (
    <div
      className="rounded-lg border border-red-900/50 bg-red-950/30 p-4 text-red-100"
      role="alert"
    >
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-red-200/90">{message}</p>
      {code ? (
        <p className="mt-2 font-mono text-xs text-red-300/80">Code: {code}</p>
      ) : null}
      {onRetry && canRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-md bg-red-900/60 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-800/80"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
