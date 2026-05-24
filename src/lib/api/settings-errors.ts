import { displayApiError } from "./display-api-error";

/** User-facing settings error message from the API error catalog. */
export function friendlySettingsError(error: unknown): string {
  return displayApiError(error, "settings").message;
}
