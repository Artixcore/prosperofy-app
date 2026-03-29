import Link from "next/link";
import { PageHeader } from "@/components/page-header";

export default function DashboardHomePage() {
  return (
    <>
      <PageHeader
        title="Overview"
        description="Authenticated dashboard. All data flows through Laravel core — never call internal AI or wallet services from the browser."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/wallets", title: "Wallets", body: "Connect and manage wallets via the API gateway." },
          { href: "/analysis", title: "Market analysis", body: "Run AI-backed analysis through Laravel." },
          { href: "/strategy", title: "Strategy", body: "Generate, score, and backtest strategies." },
          { href: "/strategy/evaluate", title: "Async evaluation", body: "Dispatch jobs and track orchestration status." },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-lg border border-surface-border bg-surface-raised/60 p-5 transition hover:border-zinc-600"
          >
            <h2 className="font-medium text-white">{card.title}</h2>
            <p className="mt-2 text-sm text-zinc-400">{card.body}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
