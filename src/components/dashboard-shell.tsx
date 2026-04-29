"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Bell, ChartColumn, CreditCard, Home, Settings, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth/session-context";
import { useNotificationsQuery } from "@/features/app/use-notifications";

const nav = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/wallets", label: "Wallets", icon: CreditCard },
  { href: "/analysis", label: "Analysis", icon: ChartColumn },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: typeof Home }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
        active
          ? "bg-surface-raised text-content-primary"
          : "text-content-muted hover:bg-surface-raised/60 hover:text-content-primary"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const unreadQuery = useNotificationsQuery({ unread: true, perPage: 1, page: 1 });
  const unreadFromPagination = unreadQuery.data?.pagination?.total;
  const unreadCount = typeof unreadFromPagination === "number"
    ? unreadFromPagination
    : (unreadQuery.data?.items?.length ?? 0);
  const isNonProd =
    typeof process.env.NEXT_PUBLIC_VERCEL_ENV !== "undefined"
      ? process.env.NEXT_PUBLIC_VERCEL_ENV !== "production"
      : process.env.NODE_ENV !== "production";

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="hidden w-64 shrink-0 border-r border-surface-border bg-surface-elevated/90 p-4 md:block">
        <div className="mb-6 px-2">
          <span className="text-lg font-semibold text-content-primary">Prosperofy</span>
          <p className="text-xs text-content-muted">Client dashboard</p>
        </div>
        <nav className="space-y-0.5">
          {nav.map((item) => {
            const label =
              item.href === "/notifications" && unreadCount > 0
                ? `${item.label} (${unreadCount})`
                : item.label;
            return <NavLink key={item.href} href={item.href} label={label} icon={item.icon} />;
          })}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-surface-border bg-surface-elevated/80 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-3 md:hidden">
            <span className="font-semibold text-content-primary">Prosperofy</span>
          </div>
          {isNonProd ? (
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
              Non-production
            </span>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="hidden max-w-[200px] truncate text-sm text-content-muted sm:inline">
              {user?.email}
            </span>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-lg border border-surface-border px-3 py-1.5 text-sm text-content-muted hover:bg-surface-raised"
            >
              Log out
            </button>
          </div>
        </header>
        <div className="fixed bottom-0 left-0 right-0 z-20 grid grid-cols-5 gap-1 border-t border-surface-border bg-surface-elevated/95 p-2 backdrop-blur md:hidden">
          {nav.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-2 py-2 text-center text-[11px] text-content-muted hover:bg-surface-raised hover:text-content-primary"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <main className="flex-1 px-4 py-6 pb-20 md:px-8 md:pb-6">{children}</main>
      </div>
    </div>
  );
}
