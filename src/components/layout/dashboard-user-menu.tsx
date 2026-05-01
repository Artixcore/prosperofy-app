"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/system/toast-context";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import { useAuth } from "@/lib/auth/session-context";

export function DashboardUserMenu() {
  const { user, logout } = useAuth();
  const { pushToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const firstItemRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (menuOpen && firstItemRef.current) {
      firstItemRef.current.focus();
    }
  }, [menuOpen]);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!wrapRef.current) return;
      if (event.target instanceof Node && !wrapRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
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
    } catch (error) {
      pushToast({
        tone: "error",
        title: "Could not log out",
        description: normalizeApiError(error),
      });
    }
  }

  const displayName = user?.name ?? user?.email ?? "User";

  return (
    <div className="relative shrink-0" ref={wrapRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={`Account menu for ${displayName}`}
        id="dashboard-user-menu-button"
        onClick={() => setMenuOpen((value) => !value)}
        className="flex max-w-[10rem] items-center gap-2 whitespace-nowrap rounded-xl border border-surface-border bg-surface px-2 py-2 hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:px-3 motion-safe:transition-colors"
      >
        <User className="h-4 w-4 shrink-0 text-content-muted" aria-hidden />
        <span className="hidden max-w-[140px] truncate text-sm text-content-primary md:inline">{displayName}</span>
      </button>
      {menuOpen ? (
        <div
          role="menu"
          aria-labelledby="dashboard-user-menu-button"
          className="absolute right-0 z-50 mt-2 max-h-[min(70vh,20rem)] w-48 overflow-auto rounded-xl border border-surface-border bg-surface-elevated p-1 shadow-soft"
        >
          <Link
            ref={firstItemRef}
            href="/profile"
            role="menuitem"
            tabIndex={-1}
            className="block rounded-lg px-3 py-2 text-sm text-content-primary hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={() => setMenuOpen(false)}
          >
            Profile
          </Link>
          <Link
            href="/settings"
            role="menuitem"
            tabIndex={-1}
            className="block rounded-lg px-3 py-2 text-sm text-content-primary hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={() => setMenuOpen(false)}
          >
            Settings
          </Link>
          <Link
            href="/wallet"
            role="menuitem"
            tabIndex={-1}
            className="block rounded-lg px-3 py-2 text-sm text-content-primary hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={() => setMenuOpen(false)}
          >
            Balance
          </Link>
          <button
            type="button"
            role="menuitem"
            tabIndex={-1}
            onClick={() => {
              setMenuOpen(false);
              void handleLogout();
            }}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:text-red-300 dark:hover:bg-red-950/40"
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
