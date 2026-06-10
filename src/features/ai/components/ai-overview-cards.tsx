"use client";

import { useWalletControlCenterQuery } from "@/features/wallets/use-wallet-mutations";
import { useCurrentSubscription } from "@/features/billing/use-current-subscription";

export function AiOverviewCards() {
  const wallets = useWalletControlCenterQuery();
  const subscription = useCurrentSubscription();

  const subWallets = wallets.data?.sub_wallets ?? [];
  const save = subWallets.find((w) => w.type === "save");
  const invest = subWallets.find((w) => w.type === "invest");
  const spend = subWallets.find((w) => w.type === "spend");

  const planName = subscription.data?.plan_name ?? "Free";
  const aiAccess = subscription.data?.metadata?.ai_access ?? "limited";

  return (
    <section aria-label="Overview" className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <OverviewCard label="Save Wallet" value={save ? `${save.balance} ${save.currency}` : "—"} hint={save?.status ?? "ready"} />
      <OverviewCard label="Invest Wallet" value={invest ? `${invest.balance} ${invest.currency}` : "—"} hint={invest?.status ?? "ready"} />
      <OverviewCard label="Spend Wallet" value={spend ? `${spend.balance} ${spend.currency}` : "—"} hint={spend?.status ?? "ready"} />
      <OverviewCard label="Membership" value={planName} hint={`AI access: ${aiAccess}`} />
    </section>
  );
}

function OverviewCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="rounded-xl border border-surface-border bg-surface-raised p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-content-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-content-primary">{value}</p>
      <p className="mt-1 text-xs text-content-muted capitalize">{hint}</p>
    </article>
  );
}
