import { ApiErrorPanel } from "./api-error-panel";
import type { ApiErrorContext } from "@/lib/api/display-api-error";

type Props = {
  error: unknown;
  onRetry?: () => void;
  title?: string;
  context?: ApiErrorContext;
};

export function ErrorState({ error, onRetry, title = "Something went wrong", context = "default" }: Props) {
  return <ApiErrorPanel error={error} onRetry={onRetry} title={title} context={context} />;
}
