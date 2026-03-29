import type { UseFormSetError, FieldValues, Path } from "react-hook-form";
import { isApiClientError } from "@/lib/api/errors";

/** Maps Laravel envelope `errors` object to react-hook-form field errors. */
export function mergeServerFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): boolean {
  if (!isApiClientError(error)) return false;
  const entries = Object.entries(error.fieldErrors);
  if (entries.length === 0) return false;
  for (const [key, messages] of entries) {
    const msg = messages?.[0];
    if (msg) {
      setError(key as Path<T>, { type: "server", message: msg });
    }
  }
  return true;
}
