"use client";

import { useState } from "react";
import { InlineAlert } from "@/components/system/inline-alert";
import { LoadingState } from "@/components/system/loading-state";
import { CardActions } from "@/components/card/card-actions";
import { CardHero } from "@/components/card/card-hero";
import { CardStatusPanel } from "@/components/card/card-status-panel";
import {
  useCardCheckoutMutation,
  useCardOverviewQuery,
  useRefreshCardOrderMutation,
} from "@/features/card/use-card-overview";
import { getCardCheckoutErrorMessage } from "@/lib/card/checkout-error-message";
import { resolveCheckoutUrl } from "@/lib/billing/resolve-checkout-url";
import { isSafePaymentRedirectUrl } from "@/lib/billing/safe-payment-url";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import type { CardCheckoutResponse } from "@/lib/api/types";

const MISSING_PAYMENT_URL_MESSAGE =
  "Payment checkout was created, but no payment link was returned. Please contact support.";

function extractCheckoutUrl(data: CardCheckoutResponse, overviewCheckoutUrl?: string | null) {
  return (
    resolveCheckoutUrl(data as unknown as Record<string, unknown>) ??
    overviewCheckoutUrl ??
    null
  );
}

export function CardPageContent() {
  const overview = useCardOverviewQuery();
  const checkout = useCardCheckoutMutation();
  const refreshOrder = useRefreshCardOrderMutation();
  const [payCurrency, setPayCurrency] = useState("usdttrc20");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null);

  if (overview.isLoading) {
    return <LoadingState label="Loading Prosperity Card…" />;
  }

  if (overview.isError) {
    return (
      <div className="space-y-4">
        <InlineAlert tone="error">{normalizeApiError(overview.error)}</InlineAlert>
        <button
          type="button"
          className="rounded-md border border-border px-4 py-2 text-sm"
          onClick={() => void overview.refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  const data = overview.data;
  if (!data) {
    return <InlineAlert tone="error">Prosperity Card data is unavailable.</InlineAlert>;
  }

  if (!data.enabled) {
    return (
      <InlineAlert tone="info">Prosperity Card is not available right now.</InlineAlert>
    );
  }

  async function redirectToCheckout(createCheckout: () => Promise<CardCheckoutResponse>) {
    setCheckoutError(null);
    setRedirectMessage(null);

    try {
      const result = await createCheckout();
      const checkoutUrl = extractCheckoutUrl(result, data?.current_order?.checkout_url ?? null);

      if (!checkoutUrl) {
        setCheckoutError(MISSING_PAYMENT_URL_MESSAGE);
        return;
      }

      if (!isSafePaymentRedirectUrl(checkoutUrl)) {
        setCheckoutError(
          "The payment link returned by the server is invalid. Please try again.",
        );
        return;
      }

      setRedirectMessage("Checkout created. Redirecting you to payment…");
      window.location.assign(checkoutUrl);
    } catch (error) {
      setCheckoutError(getCardCheckoutErrorMessage(error));
    }
  }

  const handlePay = () =>
    void redirectToCheckout(() => checkout.mutateAsync({ pay_currency: payCurrency }));

  const handleContinuePayment = () => {
    const existingUrl = data.current_order?.checkout_url;
    if (existingUrl && isSafePaymentRedirectUrl(existingUrl)) {
      window.location.assign(existingUrl);
      return;
    }
    void handlePay();
  };

  const handleRefreshStatus = async () => {
    setCheckoutError(null);
    const orderId = data.current_order?.id;
    if (!orderId) {
      await overview.refetch();
      return;
    }

    try {
      await refreshOrder.mutateAsync(orderId);
      await overview.refetch();
    } catch (error) {
      setCheckoutError(getCardCheckoutErrorMessage(error));
    }
  };

  const spendWalletReady = data.spend_wallet.status === "ready";

  return (
    <div className="space-y-6">
      <CardHero
        feeAmount={data.card.fee_amount}
        feeCurrency={data.card.fee_currency}
        cashbackRate={data.card.cashback_rate}
      />
      <CardStatusPanel
        card={data.card}
        currentOrder={data.current_order}
        spendWallet={data.spend_wallet}
      />
      <CardActions
        card={data.card}
        currentOrder={data.current_order}
        membershipEligible={data.membership.eligible}
        membershipRequired={data.membership.required}
        spendWalletReady={spendWalletReady}
        payCurrency={payCurrency}
        onPayCurrencyChange={setPayCurrency}
        onPay={handlePay}
        onContinuePayment={handleContinuePayment}
        onRefreshStatus={() => void handleRefreshStatus()}
        loadingCheckout={checkout.isPending}
        loadingRefresh={refreshOrder.isPending || overview.isFetching}
        checkoutError={checkoutError}
        redirectMessage={redirectMessage}
      />
    </div>
  );
}
