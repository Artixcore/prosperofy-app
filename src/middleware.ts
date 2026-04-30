import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { buildContentSecurityPolicy } from "@/lib/csp/build-csp";
import { resolveSafeNextPath } from "@/lib/auth/safe-next";

const AUTH_ROUTES = ["/login", "/register"];

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/profile",
  "/settings",
  "/wallets",
  "/analysis",
  "/strategy",
  "/jobs",
  "/activity",
  "/notifications",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function middleware(request: NextRequest) {
  const authed = request.cookies.get("pf_authed")?.value === "1";
  const { pathname } = request.nextUrl;

  if (isProtectedPath(pathname) && !authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", resolveSafeNextPath(pathname));
    return NextResponse.redirect(url);
  }

  if (AUTH_ROUTES.includes(pathname) && authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }
  const nonce = globalThis.crypto.randomUUID();
  const csp = buildContentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  // Exclude `/health` only as a path segment, not every path starting with "health".
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|health(?:/|$)).*)",
  ],
};
