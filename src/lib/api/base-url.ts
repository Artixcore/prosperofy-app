/** Shared Laravel API base URL resolution for client fetch and CSP connect-src. */
export function resolveLaravelApiBaseUrl(): string {
  const raw =
    typeof process.env.NEXT_PUBLIC_LARAVEL_API_BASE_URL === "string"
      ? process.env.NEXT_PUBLIC_LARAVEL_API_BASE_URL.trim()
      : typeof process.env.NEXT_PUBLIC_API_BASE_URL === "string"
        ? process.env.NEXT_PUBLIC_API_BASE_URL.trim()
        : "";

  if (!raw) {
    return "";
  }

  return raw.replace(/\/+$/, "");
}

/** Origin for CSP connect-src, or empty when API base URL is unset/invalid. */
export function resolveLaravelApiOrigin(): string {
  const base = resolveLaravelApiBaseUrl();
  if (!base) {
    return "";
  }

  try {
    return new URL(base).origin;
  } catch {
    return "";
  }
}
