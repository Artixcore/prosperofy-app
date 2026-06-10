"use client";

import Link from "next/link";

export function YieldMembershipGate() {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <p className="text-sm text-content-primary">
        Your current membership does not include Yield Pools.
      </p>
      <Link
        href="/settings/billing/upgrade"
        className="mt-3 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:brightness-110"
      >
        View membership plans
      </Link>
    </div>
  );
}
