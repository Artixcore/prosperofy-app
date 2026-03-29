"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth/session-context";

const nav = [
  { href: "/dashboard", label: "Overview" },
  { href: "/wallets", label: "Wallets" },
  { href: "/analysis", label: "Analysis" },
  { href: "/strategy", label: "Strategy" },
  { href: "/strategy/evaluate", label: "Evaluate (async)" },
  { href: "/activity", label: "Activity" },
  { href: "/notifications", label: "Notifications" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`block rounded-md px-3 py-2 text-sm transition ${
        active
          ? "bg-surface-raised text-white"
          : "text-zinc-400 hover:bg-surface-raised/60 hover:text-zinc-200"
      }`}
    >
      {label}
    </Link>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const isNonProd =
    typeof process.env.NEXT_PUBLIC_VERCEL_ENV !== "undefined"
      ? process.env.NEXT_PUBLIC_VERCEL_ENV !== "production"
      : process.env.NODE_ENV !== "production";

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r border-surface-border bg-surface-raised/40 p-4 md:block">
        <div className="mb-6 px-2">
          <span className="text-lg font-semibold text-white">Prosperofy</span>
          <p className="text-xs text-zinc-500">Dashboard</p>
        </div>
        <nav className="space-y-0.5">
          {nav.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-surface-border bg-surface/80 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-3 md:hidden">
            <span className="font-semibold text-white">Prosperofy</span>
          </div>
          {isNonProd ? (
            <span className="rounded bg-amber-950/80 px-2 py-0.5 text-xs text-amber-200">
              Non-production
            </span>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3">
            <span className="hidden max-w-[200px] truncate text-sm text-zinc-400 sm:inline">
              {user?.email}
            </span>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-md border border-surface-border px-3 py-1.5 text-sm text-zinc-300 hover:bg-surface-raised"
            >
              Log out
            </button>
          </div>
        </header>
        <div className="flex flex-wrap gap-1 border-b border-surface-border bg-surface-raised/30 px-3 py-2 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-2 py-1 text-xs text-zinc-400 hover:bg-surface-raised hover:text-zinc-200"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
