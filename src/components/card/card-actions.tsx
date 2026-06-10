import Link from "next/link";
import { InlineAlert } from "@/components/system/inline-alert";
import type { CardOrderSummary, ProsperityCardSummary } from "@/lib/api/types";

const PAY_CURRENCIES = [
  { value: "usdttrc20", label: "USDT (TRC20)" },
  { value: "btc", label: "BTC" },
] as const;

type Props = {
  card: ProsperityCardSummary;
  currentOrder: CardOrderSummary | null;
  membershipEligible: boolean;
  membershipRequired: boolean;
  spendWalletReady: boolean;
  payCurrency: string;
  onPayCurrencyChange: (value: string) => void;
  onPay: () => void;
  onContinuePayment: () => void;
  onRefreshStatus: () => void;
  loadingCheckout: boolean;
  loadingRefresh: boolean;
  checkoutError: string | null;
  redirectMessage: string | null;
};

export function CardActions({
  card,
  currentOrder,
  membershipEligible,
  membershipRequired,
  spendWalletReady,
  payCurrency,
  onPayCurrencyChange,
  onPay,
  onContinuePayment,
  onRefreshStatus,
  loadingCheckout,
  loadingRefresh,
  checkoutError,
  redirectMessage,
}: Props) {
  if (membershipRequired && !membershipEligible) {
    return (
      <section className="space-y-4 rounded-xl border border-border bg-card p-6">
        <InlineAlert tone="warning">
          Your current membership does not include Prosperity Card access.
        </InlineAlert>
        <Link
          href="/settings/billing/upgrade"
          className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          View membership plans
        </Link>
      </section>
    );
  }

  if (!spendWalletReady && card.spend_wallet_required) {
    return (
      <section className="rounded-xl border border-border bg-card p-6">
        <InlineAlert tone="warning">
          Your Spend Wallet must be ready before card activation.
        </InlineAlert>
      </section>
    );
  }

  const feeLabel =
    card.fee_currency.toUpperCase() === "USD"
      ? `$${card.fee_amount}`
      : `${card.fee_amount} ${card.fee_currency}`;

  const isActive = card.status === "active";
  const isPaidPending =
    card.status === "paid_pending_activation" || card.status === "activation_processing";
  const isPaymentPending =
    card.status === "payment_pending" ||
    card.status === "checkout_pending" ||
    currentOrder?.status === "payment_pending" ||
    currentOrder?.status === "checkout_created";

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-6">
      <h3 className="text-base font-semibold text-foreground">Actions</h3>

      <p className="text-sm text-muted-foreground">
        Your card fee is processed through NOWPayments. Card activation begins after
        payment confirmation.
      </p>

      <p className="text-sm text-muted-foreground">
        Eligible cashback is recorded to your Save Wallet after qualifying card activity.
      </p>

      {!isActive && !isPaidPending && !isPaymentPending ? (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground" htmlFor="pay-currency">
            Payment currency
          </label>
          <select
            id="pay-currency"
            value={payCurrency}
            onChange={(event) => onPayCurrencyChange(event.target.value)}
            className="w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            {PAY_CURRENCIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {checkoutError ? <InlineAlert tone="error">{checkoutError}</InlineAlert> : null}
      {redirectMessage ? <InlineAlert tone="info">{redirectMessage}</InlineAlert> : null}

      {isActive ? (
        <p className="text-sm font-medium text-foreground">Card active</p>
      ) : isPaidPending ? (
        <p className="text-sm text-muted-foreground">
          Payment received. Your card activation is being processed.
        </p>
      ) : isPaymentPending ? (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onContinuePayment}
            disabled={loadingCheckout}
            className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {loadingCheckout ? "Creating checkout…" : "Continue payment"}
          </button>
          <button
            type="button"
            onClick={onRefreshStatus}
            disabled={loadingRefresh}
            className="inline-flex rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-60"
          >
            {loadingRefresh ? "Refreshing…" : "Refresh status"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onPay}
          disabled={loadingCheckout}
          className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {loadingCheckout ? "Creating checkout…" : `Pay ${feeLabel} card fee`}
        </button>
      )}
    </section>
  );
}
