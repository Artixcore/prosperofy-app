"use client";

import { ShieldCheck } from "lucide-react";
import { DashboardNavLink } from "@/components/layout/dashboard-nav-link";
import { DASHBOARD_NAV } from "@/components/layout/dashboard-nav";

type Props = {
  collapsed: boolean;
  unreadCount: number;
  userEmail: string | undefined;
  isNonProd: boolean;
};

export function DashboardSidebar({ collapsed, unreadCount, userEmail, isNonProd }: Props) {
  return (
    <aside
      id="dashboard-sidebar"
      className={`relative hidden shrink-0 overflow-hidden border-r border-surface-border bg-surface-elevated/90 motion-safe:transition-[width] motion-safe:duration-200 motion-reduce:transition-none lg:block ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className={`flex h-full min-h-screen flex-col ${collapsed ? "px-2 py-4" : "p-4"}`}>
        <div className={`mb-6 ${collapsed ? "flex justify-center px-0" : "px-2"}`}>
          {collapsed ? (
            <span className="text-lg font-semibold text-content-primary" title="Prosperofy">
              P
            </span>
          ) : (
            <>
              <span className="text-lg font-semibold text-content-primary">Prosperofy</span>
              <p className="text-xs text-content-muted">Wallet dashboard</p>
            </>
          )}
        </div>
        <nav className="flex flex-1 flex-col space-y-0.5 overflow-y-auto overflow-x-hidden">
          {DASHBOARD_NAV.map((item) => {
            const label =
              item.href === "/notifications" && unreadCount > 0
                ? `${item.label} (${unreadCount})`
                : item.label;
            return (
              <DashboardNavLink
                key={item.href}
                {...item}
                label={label}
                collapsed={collapsed}
              />
            );
          })}
        </nav>
        <div
          className={`mt-auto shrink-0 border-t border-surface-border pt-4 text-xs text-content-muted ${
            collapsed ? "flex flex-col items-center gap-2 px-0" : "space-y-2 px-2"
          }`}
        >
          {collapsed ? (
            <span title={`Session secured${userEmail ? ` · ${userEmail}` : ""}`}>
              <ShieldCheck className="h-4 w-4 text-content-muted" aria-hidden />
              <span className="sr-only">Session secured</span>
            </span>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>Session secured</span>
              </div>
              {userEmail ? <p className="truncate">{userEmail}</p> : null}
              {isNonProd ? (
                <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-[11px] text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                  Non-production
                </span>
              ) : null}
            </>
          )}
          {collapsed && isNonProd ? (
            <span
              className="rounded bg-amber-100 px-1 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
              title="Non-production environment"
            >
              NP
            </span>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
