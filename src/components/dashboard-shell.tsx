"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Bell,
  Bot,
  ChartColumn,
  CreditCard,
  Home,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  User,
  Wallet,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useNotificationsQuery } from "@/features/app/use-notifications";
import { useAppWalletOverviewQuery } from "@/features/wallets/use-wallet-mutations";
import { useToast } from "@/components/system/toast-context";
import { shortenAddress } from "@/lib/formatters";
import { useAuth } from "@/lib/auth/session-context";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/wallet", label: "Wallets", icon: CreditCard },
  { href: "/analysis", label: "Agents", icon: Bot },
  { href: "/activity", label: "Activity", icon: ChartColumn },
  { href: "/notifications", label: "Others", icon: Bell },
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
          ? "bg-surface-raised text-content-primary ring-1 ring-surface-border"
          : "text-content-muted hover:bg-surface-raised/60 hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { pushToast } = useToast();
  const unreadQuery = useNotificationsQuery({ unread: true, perPage: 1, page: 1 });
  const walletOverview = useAppWalletOverviewQuery();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const unreadFromPagination = unreadQuery.data?.pagination?.total;
  const unreadCount = typeof unreadFromPagination === "number"
    ? unreadFromPagination
    : (unreadQuery.data?.items?.length ?? 0);
  const isNonProd =
    typeof process.env.NEXT_PUBLIC_VERCEL_ENV !== "undefined"
      ? process.env.NEXT_PUBLIC_VERCEL_ENV !== "production"
      : process.env.NODE_ENV !== "production";
  const walletStatus = walletOverview.data?.wfl_wallet?.status;
  const walletAddress = walletOverview.data?.wfl_wallet?.public_ethereum_address
    ?? walletOverview.data?.wfl_wallet?.public_solana_address
    ?? walletOverview.data?.wfl_wallet?.public_bitcoin_address
    ?? null;

  const walletBalanceText = useMemo(() => {
    if (walletOverview.isPending) return "Loading balance...";
    if (walletOverview.isError) return "Balance unavailable";
    if (!walletStatus) return "No WFL Wallet yet";
    if (walletAddress) return shortenAddress(walletAddress);
    return "WFL Wallet ready";
  }, [walletOverview.isError, walletOverview.isPending, walletAddress, walletStatus]);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!menuRef.current) return;
      if (event.target instanceof Node && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setDrawerOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  async function handleLogout() {
    try {
      await logout();
    } catch {
      pushToast({
        tone: "error",
        title: "Could not log out",
        description: "Please refresh the page and try again.",
      });
    }
  }

  const mobileNavItems = nav.slice(0, 4);

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="hidden w-72 shrink-0 border-r border-surface-border bg-surface-elevated/90 p-4 lg:block">
        <div className="mb-6 px-2">
          <span className="text-lg font-semibold text-content-primary">Prosperofy</span>
          <p className="text-xs text-content-muted">Wallet-enabled dashboard</p>
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

      {drawerOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden" aria-hidden={!drawerOpen}>
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation menu"
          />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-surface-border bg-surface-elevated p-4 shadow-soft">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-content-primary">Prosperofy</p>
                <p className="text-xs text-content-muted">Navigation</p>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                className="rounded-lg border border-surface-border p-2 text-content-muted hover:bg-surface-raised"
                onClick={() => setDrawerOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="space-y-1">
              {nav.map((item) => (
                <div key={item.href} onClick={() => setDrawerOpen(false)}>
                  <NavLink href={item.href} label={item.label} icon={item.icon} />
                </div>
              ))}
            </nav>
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-surface-border bg-surface-elevated/90 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-lg border border-surface-border p-2 text-content-muted hover:bg-surface-raised lg:hidden"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open navigation menu"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="hidden lg:block">
                <p className="text-xs text-content-muted">Dashboard</p>
                <p className="text-sm font-semibold text-content-primary">Wallet workspace</p>
              </div>
            </div>

            <label className="order-3 flex w-full items-center gap-2 rounded-xl border border-surface-border bg-surface px-3 py-2 text-content-muted sm:order-none sm:max-w-xs md:max-w-sm">
              <Search className="h-4 w-4" aria-hidden />
              <input
                type="search"
                placeholder="Search wallets, assets, agents..."
                className="w-full bg-transparent text-sm text-content-primary placeholder:text-content-muted/80 focus:outline-none"
                aria-label="Search wallets, assets, agents"
              />
            </label>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                href="/wallet"
                className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface px-3 py-2 text-xs text-content-primary hover:bg-surface-raised sm:text-sm"
              >
                <Wallet className="h-4 w-4 text-accent" />
                <span className="font-medium">WFL Wallet</span>
                <span className="max-w-28 truncate text-content-muted">{walletBalanceText}</span>
              </Link>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((value) => !value)}
                  className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface px-3 py-2 hover:bg-surface-raised"
                >
                  <User className="h-4 w-4 text-content-muted" />
                  <span className="hidden max-w-[140px] truncate text-sm text-content-primary md:inline">
                    {user?.name ?? user?.email ?? "User"}
                  </span>
                </button>
                {menuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-48 rounded-xl border border-surface-border bg-surface-elevated p-1 shadow-soft"
                  >
                    <Link href="/profile" role="menuitem" className="block rounded-lg px-3 py-2 text-sm text-content-primary hover:bg-surface-raised">
                      Profile
                    </Link>
                    <Link href="/settings" role="menuitem" className="block rounded-lg px-3 py-2 text-sm text-content-primary hover:bg-surface-raised">
                      Settings
                    </Link>
                    <Link href="/wallet" role="menuitem" className="block rounded-lg px-3 py-2 text-sm text-content-primary hover:bg-surface-raised">
                      Balance
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => void handleLogout()}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 text-xs text-content-muted">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Session secured</span>
            </div>
            <span className="truncate">{user?.email}</span>
          </div>
          <div className="mt-2">
            {isNonProd ? (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                Non-production
              </span>
            ) : null}
          </div>
        </header>
        <div className="fixed bottom-0 left-0 right-0 z-20 grid grid-cols-4 gap-1 border-t border-surface-border bg-surface-elevated/95 p-2 backdrop-blur lg:hidden">
          {mobileNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-2 py-2 text-center text-[11px] text-content-muted hover:bg-surface-raised hover:text-content-primary"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <main className="flex-1 px-4 py-6 pb-20 md:px-8 md:pb-6">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
