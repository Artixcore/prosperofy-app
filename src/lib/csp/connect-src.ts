import { resolveLaravelApiOrigin } from "@/lib/api/base-url";

/** connect-src directive value for Content-Security-Policy (Laravel API + same origin). */
export function connectSrc(): string {
  const origin = resolveLaravelApiOrigin();
  if (!origin) return "'self'";
  return `'self' ${origin}`;
}
