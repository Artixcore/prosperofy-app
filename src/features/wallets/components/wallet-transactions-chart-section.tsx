"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LoadingState } from "@/components/system/loading-state";
import { useWalletTransactionsChartQuery } from "@/features/wallets/use-wallet-send";

export function WalletTransactionsChartSection() {
  const chart = useWalletTransactionsChartQuery("30d");

  return (
    <section
      className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-soft"
      aria-label="Wallet transaction volume"
    >
      <header className="mb-4">
        <h2 className="text-base font-semibold tracking-tight text-content-primary">
          Transaction volume (30 days)
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Daily sent and received amounts for your WFL Wallet.
        </p>
      </header>

      {chart.isPending ? (
        <LoadingState label="Loading chart…" className="!py-8" />
      ) : chart.isError ? (
        <p className="text-sm text-muted-foreground">
          We could not load transaction chart data right now.
        </p>
      ) : !chart.data?.points?.length ? (
        <p className="text-sm text-muted-foreground">No transaction activity in this period.</p>
      ) : (
        <div className="h-72 min-h-[240px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart.data.points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(value: string) => value.slice(5)}
              />
              <YAxis tick={{ fontSize: 11 }} width={48} />
              <Tooltip
                formatter={(value, name) => [
                  value == null ? "0" : String(value),
                  name === "sent_amount" ? "Sent" : "Received",
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar dataKey="sent_amount" name="sent_amount" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="received_amount" name="received_amount" fill="hsl(var(--chart-2, 142 76% 36%))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
