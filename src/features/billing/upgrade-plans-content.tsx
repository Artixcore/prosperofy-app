"use client";

import Link from "next/link";
import { useState } from "react";
import { InlineAlert } from "@/components/system/inline-alert";
import { LoadingState } from "@/components/system/loading-state";
import type { BillingInterval } from "@/features/billing/billing-plan-display";
import {
  getPlanCtaState,
  plansSupportYearly,
  sortPlans,
} from "@/features/billing/billing-plan-display";
import { PlanPricingCard } from "@/features/billing/plan-pricing-card";
import { useBillingCheckoutMutation } from "@/features/billing/use-billing-checkout";
import { useCurrentSubscription } from "@/features/billing/use-current-subscription";
import { useSubscriptionPlans } from "@/features/billing/use-subscription-plans";
import type { SubscriptionPlanRow } from "@/lib/api/types";
import { isSafePaymentRedirectUrl } from "@/lib/billing/safe-payment-url";

const CHECKOUT_ERROR_MESSAGE =
  "We couldn't start checkout right now. Please try again.";
const CHECKOUT_REDIRECT_MESSAGE = "Checkout created. Redirecting you to payment…";
const INVALID_PAYMENT_URL_MESSAGE =
  "Checkout returned an invalid payment link. Please try again or contact support.";

export function UpgradePlansContent() {
  const plans = useSubscriptionPlans();
  const subscription = useCurrentSubscription();
  const checkout = useBillingCheckoutMutation();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");
  const [checkoutSlug, setCheckoutSlug] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null);
  const [redirectError, setRedirectError] = useState<string | null>(null);

  if (plans.isLoading || subscription.isLoading) {
    return <LoadingState label="Loading plans…" />;
  }

  if (plans.isError) {
    return (
      <div className="min-w-0 max-w-full space-y-4">
        <Link
          href="/settings/billing"
          className="inline-flex text-sm text-primary hover:underline"
        >
          ← Back to Billing
        </Link>
        <InlineAlert tone="error">
          We couldn&apos;t load plans right now. Please try again.
        </InlineAlert>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          onClick={() => void plans.refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  const planRows = sortPlans(plans.data?.plans ?? []);
  const currentSlug = subscription.data?.plan_slug ?? "free";
  const currentPlanName = subscription.data?.plan_name ?? "Free";
  const showYearlyToggle = plansSupportYearly(planRows);

  async function handleCheckout(plan: SubscriptionPlanRow) {
    setCheckoutSlug(plan.slug);
    setCheckoutError(null);
    setRedirectError(null);
    setRedirectMessage(null);

    try {
      const result = await checkout.mutateAsync({
        plan_slug: plan.slug,
        billing_interval: billingInterval,
      });

      if (result.payment_url) {
        if (!isSafePaymentRedirectUrl(result.payment_url)) {
          setRedirectError(INVALID_PAYMENT_URL_MESSAGE);
          setCheckoutSlug(null);
          return;
        }
        setRedirectMessage(CHECKOUT_REDIRECT_MESSAGE);
        window.location.href = result.payment_url;
        return;
      }

      await subscription.refetch();
      setCheckoutSlug(null);
    } catch {
      setCheckoutError(CHECKOUT_ERROR_MESSAGE);
      setCheckoutSlug(null);
    }
  }

  return (
    <div className="min-w-0 max-w-full space-y-6">
      <div className="space-y-3">
        <Link
          href="/settings/billing"
          className="inline-flex text-sm text-primary hover:underline"
        >
          ← Back to Billing
        </Link>

        <div>
          <h1 className="text-xl font-semibold text-foreground">Choose your plan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upgrade when you are ready. You can start with Free and move up anytime.
          </p>
        </div>

        <InlineAlert tone="info">
          Current plan: <span className="font-medium">{currentPlanName}</span>
        </InlineAlert>
      </div>

      {showYearlyToggle ? (
        <div
          className="inline-flex rounded-lg border border-border p-1"
          role="group"
          aria-label="Billing interval"
        >
          <button
            type="button"
            className={`rounded-md px-3 py-1.5 text-sm font-medium motion-safe:transition-colors ${
              billingInterval === "monthly"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-pressed={billingInterval === "monthly"}
            onClick={() => setBillingInterval("monthly")}
          >
            Monthly
          </button>
          <button
            type="button"
            className={`rounded-md px-3 py-1.5 text-sm font-medium motion-safe:transition-colors ${
              billingInterval === "yearly"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-pressed={billingInterval === "yearly"}
            onClick={() => setBillingInterval("yearly")}
          >
            Yearly
          </button>
        </div>
      ) : null}

      {redirectMessage ? <InlineAlert tone="info">{redirectMessage}</InlineAlert> : null}
      {checkoutError ? <InlineAlert tone="error">{checkoutError}</InlineAlert> : null}
      {redirectError ? <InlineAlert tone="error">{redirectError}</InlineAlert> : null}

      <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {planRows.map((plan) => {
          const ctaState = getPlanCtaState(plan, currentSlug);
          const isBusy = checkout.isPending && checkoutSlug === plan.slug;

          return (
            <PlanPricingCard
              key={plan.id}
              plan={plan}
              currentSlug={currentSlug}
              billingInterval={billingInterval}
              ctaState={ctaState}
              isBusy={isBusy}
              onCheckout={(selectedPlan) => void handleCheckout(selectedPlan)}
            />
          );
        })}
      </div>

      {planRows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No subscription plans are available yet.</p>
      ) : null}
    </div>
  );
}
