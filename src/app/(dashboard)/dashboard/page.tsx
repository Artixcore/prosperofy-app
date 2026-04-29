"use client";

import Link from "next/link";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { CreditCard, FilePlus2, Wallet } from "lucide-react";
import { useDashboardSummaryQuery } from "@/features/app/use-dashboard-summary";
import { useV1TransactionsQuery } from "@/features/app/use-v1-transactions";
import { useV1VirtualCardsQuery } from "@/features/app/use-v1-virtual-cards";
import { useNotificationsQuery } from "@/features/app/use-notifications";
import { ErrorState } from "@/components/system/error-state";
import { LoadingState } from "@/components/system/loading-state";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-surface-border bg-surface-elevated p-5 shadow-soft">
      <h2 className="text-sm font-medium text-content-muted">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function DashboardHomePage() {
  const summary = useDashboardSummaryQuery();
  const tx = useV1TransactionsQuery();
  const cards = useV1VirtualCardsQuery();
  const notifications = useNotificationsQuery({ perPage: 4 });

  if (summary.isPending) return <LoadingState label="Loading your financial dashboard..." />;
  if (summary.isError || !summary.data) {
    return <ErrorState error={summary.error} onRetry={() => void summary.refetch()} />;
  }

  const completion = summary.data.contractType.completionRate;
  const completionData = [
    { name: "Done", value: completion },
    { name: "Remaining", value: 100 - completion },
  ];

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-surface-border bg-surface-elevated p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-content-muted">Client Dashboard</p>
            <h1 className="mt-1 text-2xl font-semibold text-content-primary">Welcome back to Prosperofy</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-xl border border-surface-border px-3 py-2 text-sm text-content-muted">
              20-27 Jan 2026
            </button>
            <button className="rounded-xl bg-accent px-3 py-2 text-sm font-medium text-white">
              Add Widget
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card title="Activity hours">
              <p className="text-3xl font-semibold text-content-primary">{summary.data.activity.hoursThisWeek}h</p>
              <div className="mt-4 h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.data.spending.trend}>
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="rgb(var(--accent))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card title="Virtual card">
              <p className="text-xs text-content-muted">{summary.data.virtualCard.maskedNumber ?? "No card yet"}</p>
              <p className="mt-2 text-3xl font-semibold text-content-primary">
                ${summary.data.virtualCard.currentBalance.toFixed(2)}
              </p>
              <p className="mt-1 text-sm text-content-muted">{summary.data.virtualCard.expiry ?? "--/--"}</p>
            </Card>
          </div>

          <Card title="Total spent this week">
            <p className="text-3xl font-semibold text-content-primary">
              ${summary.data.spending.totalThisWeek.toFixed(2)}
            </p>
            <div className="mt-4 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary.data.spending.trend}>
                  <defs>
                    <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(var(--accent))" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="rgb(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgb(var(--surface-border))" vertical={false} />
                  <Area type="monotone" dataKey="amount" stroke="rgb(var(--accent))" fill="url(#spendGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Recent transactions">
            <div className="space-y-3">
              {(tx.data?.items ?? []).map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-surface-raised p-3">
                  <div>
                    <p className="text-sm font-medium text-content-primary">{item.merchant ?? "Transaction"}</p>
                    <p className="text-xs text-content-muted">{new Date(item.transacted_at).toLocaleDateString()}</p>
                  </div>
                  <p className="text-sm font-semibold text-content-primary">${item.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-4">
          <Card title="Contract completion">
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={completionData} dataKey="value" innerRadius={55} outerRadius={80}>
                    <Cell fill="rgb(var(--accent))" />
                    <Cell fill="rgb(var(--surface-border))" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="-mt-4 text-center text-3xl font-semibold text-content-primary">{completion}%</p>
          </Card>

          <Card title="Quick actions">
            <div className="grid gap-2">
              <Link href="/wallets" className="flex items-center gap-2 rounded-xl bg-surface-raised p-3 text-sm">
                <Wallet className="h-4 w-4" /> Add card
              </Link>
              <Link href="/analysis" className="flex items-center gap-2 rounded-xl bg-surface-raised p-3 text-sm">
                <CreditCard className="h-4 w-4" /> Create analysis
              </Link>
              <Link href="/strategy" className="flex items-center gap-2 rounded-xl bg-surface-raised p-3 text-sm">
                <FilePlus2 className="h-4 w-4" /> Create report
              </Link>
            </div>
          </Card>

          <Card title={`Notifications (${summary.data.notifications.unreadCount})`}>
            <div className="space-y-2">
              {(notifications.data?.items ?? []).map((n) => (
                <div key={n.id} className="rounded-xl bg-surface-raised p-3">
                  <p className="text-sm text-content-primary">{n.title}</p>
                  <p className="text-xs text-content-muted">{n.body}</p>
                </div>
              ))}
            </div>
          </Card>

          {cards.data?.items?.[0] ? (
            <Card title="Active card">
              <p className="text-sm text-content-muted">{cards.data.items[0].masked_number}</p>
              <p className="mt-1 text-lg font-semibold text-content-primary">
                ${cards.data.items[0].current_balance.toFixed(2)}
              </p>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
