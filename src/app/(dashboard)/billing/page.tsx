"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { InlineAlert } from "@/components/system/inline-alert";
import { LoadingState } from "@/components/system/loading-state";
import { useCreateNowPaymentMutation } from "@/features/billing/use-create-now-payment";
import { useSubscriptionPlans } from "@/features/billing/use-subscription-plans";
import { normalizeApiError } from "@/lib/api/normalize-api-error";

function formatPrice(priceMinor: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(priceMinor / 100);
}

export default function BillingPage() {
  const plans = useSubscriptionPlans();
  const createPayment = useCreateNowPaymentMutation();
  const [checkoutPlanId, setCheckoutPlanId] = useState<number | null>(null);

  if (plans.isLoading) {
    return <LoadingState label="Loading plans…" />;
  }

  if (plans.isError) {
    return (
      <div className="space-y-4">
        <PageHeader title="Billing" description="Subscribe with crypto via Prosperofy." />
        <InlineAlert tone="error">{normalizeApiError(plans.error)}</InlineAlert>
      </div>
    );
  }

  const planRows = plans.data?.plans ?? [];

  async function handleCheckout(planId: number) {
    setCheckoutPlanId(planId);
    try {
      const result = await createPayment.mutateAsync({ plan_id: planId });
      if (result.payment_url) {
        window.location.href = result.payment_url;
        return;
      }
      setCheckoutPlanId(null);
    } catch {
      setCheckoutPlanId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Choose a plan and pay with crypto. Checkout is handled securely through Prosperofy."
      />

      {createPayment.isError ? (
        <InlineAlert tone="error">{normalizeApiError(createPayment.error)}</InlineAlert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {planRows.map((plan) => {
          const isBusy = createPayment.isPending && checkoutPlanId === plan.id;
          return (
            <section
              key={plan.id}
              className="flex flex-col rounded-xl border border-border bg-card p-5"
            >
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              {plan.description ? (
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              ) : null}
              <p className="mt-4 text-2xl font-semibold tabular-nums">
                {formatPrice(plan.price_minor, plan.currency)}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  / {plan.billing_interval}
                </span>
              </p>
              <button
                type="button"
                className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                disabled={isBusy || plan.price_minor <= 0}
                onClick={() => void handleCheckout(plan.id)}
              >
                {isBusy ? "Creating checkout…" : "Pay with crypto"}
              </button>
            </section>
          );
        })}
      </div>

      {planRows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No subscription plans are available.</p>
      ) : null}
    </div>
  );
}
