"use client";

import Link from "next/link";

export default function WalletCreatePage() {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold text-white">Create WFL Wallet</h1>
      <p className="text-sm text-zinc-400">Create your encrypted internal Prosperofy wallet from the wallet dashboard.</p>
      <Link className="text-sm text-accent underline" href="/wallet">Go to wallet dashboard</Link>
    </div>
  );
}
