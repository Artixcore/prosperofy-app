"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/page-header";
import { isSettingsNavActive, SETTINGS_NAV } from "@/components/settings/settings-nav";

export function SettingsLayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account, security, billing, and integrations."
      />

      <div className="lg:hidden">
        <label htmlFor="settings-module-select" className="sr-only">
          Settings section
        </label>
        <select
          id="settings-module-select"
          className="w-full rounded-xl border border-surface-border bg-surface px-3 py-2 text-sm text-content-primary"
          value={SETTINGS_NAV.find((item) => isSettingsNavActive(pathname, item.href))?.href ?? "/settings/account"}
          onChange={(event) => {
            window.location.href = event.target.value;
          }}
        >
          {SETTINGS_NAV.map((item) => (
            <option key={item.href} value={item.href}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <nav
          aria-label="Settings sections"
          className="hidden shrink-0 lg:block lg:w-56 xl:w-60"
        >
          <ul className="space-y-1">
            {SETTINGS_NAV.map((item) => {
              const active = isSettingsNavActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-xl px-3 py-2.5 motion-safe:transition-colors ${
                      active
                        ? "bg-surface-raised text-content-primary ring-1 ring-surface-border"
                        : "text-content-muted hover:bg-surface-raised/60 hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      {item.label}
                    </span>
                    <span className="mt-1 block text-xs leading-snug text-content-muted">
                      {item.description}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0 flex-1">
          <div className="rounded-2xl border border-surface-border bg-surface-elevated p-5 shadow-soft md:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
