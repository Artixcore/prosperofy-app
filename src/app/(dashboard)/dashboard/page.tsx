"use client";

import Link from "next/link";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { CreditCard, FilePlus2, Wallet } from "lucide-react";
import { useAppDashboardQuery } from "@/features/app/use-app-dashboard";
import { useNotificationsQuery } from "@/features/app/use-notifications";
import { ErrorState } from "@/components/system/error-state";
import { LoadingState } from "@/components/system/loading-state";
import { SafeChartContainer } from "@/components/system/safe-chart-container";
import type { DashboardSummary } from "@/lib/api/types";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0 rounded-3xl border border-surface-border bg-surface-elevated p-5 shadow-soft">
      <h2 className="text-sm font-medium text-content-muted">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ChartShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return <div className={`relative w-full min-w-0 ${className}`}>{children}</div>;
}

function asFiniteNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

type TrendPoint = { date: string; amount: number };

function toTrendPoints(value: unknown): TrendPoint[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((point) => {
      if (!point || typeof point !== "object") return null;
      const record = point as Record<string, unknown>;
      const date = typeof record.date === "string" ? record.date : "";
      const amount = asFiniteNumber(record.amount);
      if (!date) return null;
      return { date, amount };
    })
    .filter((point): point is TrendPoint => point !== null);
}

export default function DashboardHomePage() {
  const dashboard = useAppDashboardQuery();
  const notifications = useNotificationsQuery({ perPage: 4 });

  const overview: DashboardSummary | null = dashboard.data?.overview ?? null;
  const safeTrend = toTrendPoints(overview?.spending?.trend);
  const ledgerItems = dashboard.data?.ledger_transactions?.items ?? [];
  const safeBalance = asFiniteNumber(overview?.virtualCard?.currentBalance);
  const safeSpend = asFiniteNumber(overview?.spending?.totalThisWeek);
  const safeCompletionRate = asFiniteNumber(overview?.contractType?.completionRate);
  const safeUnread = asFiniteNumber(overview?.notifications?.unreadCount);
  const safeActivityHours = asFiniteNumber(overview?.activity?.hoursThisWeek);

  if (dashboard.isPending) {
    return <LoadingState label="Loading your financial dashboard..." />;
  }

  return (
    <div className="space-y-4">
      {dashboard.isError ? (
        <ErrorState
          error={dashboard.error}
          title="Dashboard data unavailable"
          onRetry={() => void dashboard.refetch()}
        />
      ) : null}

      <section className="rounded-3xl border border-surface-border bg-surface-elevated p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-content-muted">Client Dashboard</p>
            <h1 className="mt-1 text-2xl font-semibold text-content-primary">Welcome back to Prosperofy</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-xl border border-surface-border px-3 py-2 text-sm text-content-muted" type="button">
              20-27 Jan 2026
            </button>
            <button className="rounded-xl bg-accent px-3 py-2 text-sm font-medium text-white" type="button">
              Add Widget
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="min-w-0 space-y-4 lg:col-span-8">
          {!overview && !dashboard.isError ? (
            <LoadingState label="Loading overview…" />
          ) : null}

          {overview ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card title="Activity hours">
                  <p className="text-3xl font-semibold text-content-primary">{safeActivityHours}h</p>
                  <ChartShell className="mt-4">
                    {safeTrend.length === 0 ? (
                      <p className="text-sm text-content-muted">No data yet.</p>
                    ) : (
                      <SafeChartContainer size="small">
                        <ResponsiveContainer width="100%" height="100%" minWidth={240}>
                          <BarChart data={safeTrend}>
                            <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="rgb(var(--accent))" />
                          </BarChart>
                        </ResponsiveContainer>
                      </SafeChartContainer>
                    )}
                  </ChartShell>
                </Card>
                <Card title="Portfolio snapshot">
                  <p className="text-xs text-content-muted">
                    {overview.virtualCard.maskedNumber ?? "No linked portfolio items yet"}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-content-primary">
                    ${safeBalance.toFixed(2)}
                  </p>
                  <p className="mt-1 text-sm text-content-muted">{overview.virtualCard.expiry ?? "--/--"}</p>
                </Card>
              </div>

              <Card title="Total spent this week">
                <p className="text-3xl font-semibold text-content-primary">
                  ${safeSpend.toFixed(2)}
                </p>
                <ChartShell className="mt-4">
                  {safeTrend.length === 0 ? (
                    <p className="text-sm text-content-muted">No data yet.</p>
                  ) : (
                    <SafeChartContainer size="large">
                      <ResponsiveContainer width="100%" height="100%" minWidth={240}>
                        <AreaChart data={safeTrend}>
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
                    </SafeChartContainer>
                  )}
                </ChartShell>
              </Card>
            </>
          ) : null}

          <Card title="Recent ledger activity">
            {dashboard.isError ? (
              <p className="text-sm text-content-muted">Load the dashboard above to see transactions.</p>
            ) : ledgerItems.length === 0 ? (
              <p className="text-sm text-content-muted">No transactions yet.</p>
            ) : (
              <div className="space-y-3">
                {ledgerItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl bg-surface-raised p-3">
                    <div>
                      <p className="text-sm font-medium text-content-primary">{item.merchant ?? "Transaction"}</p>
                      <p className="text-xs text-content-muted">
                        {item.transacted_at ? new Date(item.transacted_at).toLocaleDateString() : "—"}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-content-primary">
                      ${asFiniteNumber(item.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="min-w-0 space-y-4 lg:col-span-4">
          {overview ? (
            <Card title="Contract completion">
              <ChartShell className="">
                {safeCompletionRate <= 0 ? (
                  <p className="text-sm text-content-muted">No data yet.</p>
                ) : (
                  <SafeChartContainer size="large">
                    <ResponsiveContainer width="100%" height="100%" minWidth={240}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Done", value: safeCompletionRate },
                            { name: "Remaining", value: Math.max(0, 100 - safeCompletionRate) },
                          ]}
                          dataKey="value"
                          innerRadius={55}
                          outerRadius={80}
                        >
                          <Cell fill="rgb(var(--accent))" />
                          <Cell fill="rgb(var(--surface-border))" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </SafeChartContainer>
                )}
              </ChartShell>
              <p className="-mt-4 text-center text-3xl font-semibold text-content-primary">
                {safeCompletionRate}%
              </p>
            </Card>
          ) : null}

          <Card title="Quick actions">
            <div className="grid gap-2">
              <Link href="/wallets" className="flex items-center gap-2 rounded-xl bg-surface-raised p-3 text-sm">
                <Wallet className="h-4 w-4" /> Connect wallet
              </Link>
              <Link href="/analysis" className="flex items-center gap-2 rounded-xl bg-surface-raised p-3 text-sm">
                <CreditCard className="h-4 w-4" /> Create analysis
              </Link>
              <Link href="/strategy" className="flex items-center gap-2 rounded-xl bg-surface-raised p-3 text-sm">
                <FilePlus2 className="h-4 w-4" /> Create report
              </Link>
            </div>
          </Card>

          {overview ? (
            <Card title={`Notifications (${safeUnread})`}>
              {notifications.isError ? (
                <ErrorState
                  error={notifications.error}
                  title="Notifications unavailable"
                  onRetry={() => void notifications.refetch()}
                />
              ) : notifications.isPending ? (
                <p className="text-sm text-content-muted">Loading notifications…</p>
              ) : (
                <div className="space-y-2">
                  {(notifications.data?.items ?? []).map((n) => (
                    <div key={n.id} className="rounded-xl bg-surface-raised p-3">
                      <p className="text-sm text-content-primary">{n.title}</p>
                      <p className="text-xs text-content-muted">{n.body}</p>
                    </div>
                  ))}
                  {(notifications.data?.items ?? []).length === 0 ? (
                    <p className="text-sm text-content-muted">No notifications.</p>
                  ) : null}
                </div>
              )}
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
