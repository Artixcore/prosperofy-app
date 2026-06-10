import type { CardOrderSummary, ProsperityCardSummary } from "@/lib/api/types";

type Props = {
  card: ProsperityCardSummary;
  currentOrder: CardOrderSummary | null;
  spendWallet: {
    balance: string;
    currency: string;
    status: string;
  };
};

function formatStatus(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function CardStatusPanel({ card, currentOrder, spendWallet }: Props) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-base font-semibold text-foreground">Status</h3>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Card status</dt>
          <dd className="font-medium text-foreground">{formatStatus(card.status)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Current order</dt>
          <dd className="font-medium text-foreground">
            {currentOrder ? formatStatus(currentOrder.status) : "None"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Payment status</dt>
          <dd className="font-medium text-foreground">
            {currentOrder?.payment?.status
              ? formatStatus(currentOrder.payment.status)
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Card fee</dt>
          <dd className="font-medium text-foreground">
            {card.fee_currency.toUpperCase() === "USD"
              ? `$${card.fee_amount}`
              : `${card.fee_amount} ${card.fee_currency}`}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Cashback rate</dt>
          <dd className="font-medium text-foreground">{card.cashback_rate}%</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Spend Wallet</dt>
          <dd className="font-medium text-foreground">
            {spendWallet.balance} {spendWallet.currency} · {formatStatus(spendWallet.status)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
