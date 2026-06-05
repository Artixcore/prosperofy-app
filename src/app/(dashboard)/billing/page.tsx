"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { InlineAlert } from "@/components/system/inline-alert";
import { LoadingState } from "@/components/system/loading-state";
import { useBillingCheckoutMutation } from "@/features/billing/use-billing-checkout";
import { useCurrentSubscription } from "@/features/billing/use-current-subscription";
import { useSubscriptionPlans } from "@/features/billing/use-subscription-plans";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import type { SubscriptionPlanRow } from "@/lib/api/types";
import { isSafePaymentRedirectUrl } from "@/lib/billing/safe-payment-url";

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

function isCurrentPlan(plan: SubscriptionPlanRow, currentSlug: string | undefined): boolean {
  return plan.slug === currentSlug;
}

export default function BillingPage() {
  const plans = useSubscriptionPlans();
  const subscription = useCurrentSubscription();
  const checkout = useBillingCheckoutMutation();
  const [checkoutSlug, setCheckoutSlug] = useState<string | null>(null);
  const [redirectError, setRedirectError] = useState<string | null>(null);

  if (plans.isLoading || subscription.isLoading) {
    return <LoadingState label="Loading plans…" />;
  }

  if (plans.isError) {
    return (
      <div className="space-y-4">
        <PageHeader title="Billing" description="Manage your Prosperofy subscription." />
        <InlineAlert tone="error">{normalizeApiError(plans.error)}</InlineAlert>
      </div>
    );
  }

  const planRows = plans.data?.plans ?? [];
  const currentSlug = subscription.data?.plan_slug ?? "free";
  const currentIsFree = currentSlug === "free";

  async function handleCheckout(plan: SubscriptionPlanRow) {
    setCheckoutSlug(plan.slug);
    setRedirectError(null);
    try {
      const result = await checkout.mutateAsync({
        plan_slug: plan.slug,
        billing_interval: "monthly",
      });

      if (result.payment_url) {
        if (!isSafePaymentRedirectUrl(result.payment_url)) {
          setRedirectError(
            "Checkout returned an invalid payment link. Please try again or contact support.",
          );
          setCheckoutSlug(null);
          return;
        }
        window.location.href = result.payment_url;
        return;
      }

      await subscription.refetch();
      setCheckoutSlug(null);
    } catch {
      setCheckoutSlug(null);
    }
  }

  function buttonLabel(plan: SubscriptionPlanRow): string {
    if (isCurrentPlan(plan, currentSlug)) {
      return "Current Plan";
    }
    if (plan.slug === "free") {
      return currentIsFree ? "Current Plan" : "Choose Free";
    }
    return "Subscribe";
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Choose a plan and pay with crypto. Checkout is handled securely through Prosperofy."
      />

      {subscription.data ? (
        <InlineAlert tone="info">
          Current plan: <span className="font-medium">{subscription.data.plan_name}</span>
        </InlineAlert>
      ) : null}

      {checkout.isError ? (
        <InlineAlert tone="error">{normalizeApiError(checkout.error)}</InlineAlert>
      ) : null}

      {redirectError ? <InlineAlert tone="error">{redirectError}</InlineAlert> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {planRows.map((plan) => {
          const isCurrent = isCurrentPlan(plan, currentSlug);
          const isBusy = checkout.isPending && checkoutSlug === plan.slug;
          const isFreePlan = plan.slug === "free";
          const disabled = isCurrent || isBusy;

          return (
            <section
              key={plan.id}
              className={`flex flex-col rounded-xl border bg-card p-5 ${
                isCurrent ? "border-primary ring-2 ring-primary/30" : "border-border"
              }`}
            >
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              {plan.description ? (
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              ) : null}
              <p className="mt-4 text-2xl font-semibold tabular-nums">
                {formatPrice(plan.monthly_price, plan.currency)}
                <span className="ml-1 text-sm font-normal text-muted-foreground">/ month</span>
              </p>
              {plan.features.length > 0 ? (
                <ul className="mt-4 flex-1 space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span aria-hidden className="text-primary">
                        •
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <button
                type="button"
                className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                disabled={disabled || (isFreePlan && isCurrent)}
                onClick={() => void handleCheckout(plan)}
              >
                {isBusy ? "Creating checkout…" : buttonLabel(plan)}
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
