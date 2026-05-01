"use client";

import { Search } from "lucide-react";

export function DashboardSearch() {
  return (
    <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-surface-border bg-surface px-3 py-2 text-content-muted">
      <Search className="h-4 w-4 shrink-0" aria-hidden />
      <input
        type="search"
        placeholder="Search wallets, assets, agents..."
        className="min-w-0 flex-1 bg-transparent text-sm text-content-primary placeholder:text-content-muted focus:outline-none"
        aria-label="Search wallets, assets, agents"
      />
    </label>
  );
}
