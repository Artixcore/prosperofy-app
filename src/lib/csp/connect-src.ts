/** connect-src directive value for Content-Security-Policy (Laravel API + same origin). */
export function connectSrc(): string {
  const raw = process.env.NEXT_PUBLIC_LARAVEL_API_BASE_URL?.trim() ?? "";
  const api = raw.replace(/\/+$/, "") || "";
  if (!api) return "'self'";
  try {
    return `'self' ${new URL(api).origin}`;
  } catch {
    return "'self'";
  }
}
