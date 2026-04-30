const SAFE_NEXT_ALLOWLIST = new Set([
  "/dashboard",
  "/wallets",
  "/analysis",
  "/strategy",
  "/activity",
  "/notifications",
  "/settings",
  "/profile",
  "/jobs",
]);

function isAllowedPathname(pathname: string): boolean {
  return [...SAFE_NEXT_ALLOWLIST].some(
    (allowed) => pathname === allowed || pathname.startsWith(`${allowed}/`),
  );
}

export function resolveSafeNextPath(value: string | null | undefined): string {
  if (!value) return "/dashboard";
  const next = value.trim();
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return "/dashboard";
  }
  const [pathname] = next.split("?");
  if (!pathname || !isAllowedPathname(pathname)) {
    return "/dashboard";
  }
  return next;
}
