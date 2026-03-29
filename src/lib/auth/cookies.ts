const AUTH_FLAG = "pf_authed";
const MAX_AGE_SEC = 60 * 60 * 24 * 7;

/** MVP session flag for middleware (not httpOnly). Token stays in sessionStorage. */
export function setAuthCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_FLAG}=1; path=/; max-age=${MAX_AGE_SEC}; SameSite=Lax`;
}

export function clearAuthCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_FLAG}=; path=/; max-age=0`;
}

export function readAuthCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${AUTH_FLAG}=1`));
}
