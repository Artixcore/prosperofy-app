"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { YieldPoolsSection } from "@/features/yield/components/yield-pools-section";

export default function SaveWalletYieldPage() {
  return (
    <>
      <PageHeader
        title="Save Wallet Yield Pools"
        description="Review eligible yield opportunities for your Save Wallet."
        action={
          <Link
            href="/wallet"
            className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Back to wallets
          </Link>
        }
      />
      <YieldPoolsSection />
    </>
  );
}
