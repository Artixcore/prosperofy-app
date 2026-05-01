"use client";

import Link from "next/link";

export default function WalletConnectPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold text-white">Connect Wallet</h1>
      <p className="text-sm text-zinc-400">Use the main wallet dashboard to connect Phantom or MetaMask using signature verification.</p>
      <Link className="text-sm text-accent underline" href="/wallet">Go to wallet dashboard</Link>
    </div>
  );
}
