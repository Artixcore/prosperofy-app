"use client";

import { X } from "lucide-react";
import { DashboardNavLink } from "@/components/layout/dashboard-nav-link";
import type { DashboardNavItem } from "@/components/layout/dashboard-nav";

type Props = {
  open: boolean;
  onClose: () => void;
  nav: DashboardNavItem[];
};

export function MobileSidebarDrawer({ open, onClose, nav }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden" aria-hidden={!open}>
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/40"
        onClick={onClose}
        aria-label="Close navigation menu"
      />
      <aside className="absolute left-0 top-0 h-full w-[min(18rem,85vw)] border-r border-surface-border bg-surface-elevated p-4 shadow-soft motion-safe:transition-transform">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-content-primary">Prosperofy</p>
            <p className="text-xs text-content-muted">Navigation</p>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            className="rounded-lg border border-surface-border p-2 text-content-muted hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={onClose}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <nav className="space-y-1">
          {nav.map((item) => (
            <div key={item.href} onClick={onClose}>
              <DashboardNavLink {...item} />
            </div>
          ))}
        </nav>
      </aside>
    </div>
  );
}
