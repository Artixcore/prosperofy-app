import { connectSrc } from "./connect-src";

/** Production CSP with nonce + strict-dynamic script trust chain. */
export function buildContentSecurityPolicy(nonce: string): string {
  return [
    "default-src 'self'",
    // With strict-dynamic, host allowlists are ignored by modern browsers.
    `script-src 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src ${connectSrc()}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}
