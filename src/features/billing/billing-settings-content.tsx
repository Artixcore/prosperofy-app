"use client";

import Link from "next/link";
import { InlineAlert } from "@/components/system/inline-alert";
import { LoadingState } from "@/components/system/loading-state";
import {
  COMPLIANCE_FOOTNOTES,
  formatBillingDate,
  formatPlanStatus,
  formatPrice,
  getFeaturesForSlug,
  getPlanFeatures,
  getPlanTagline,
  getSettingsUpgradeLabel,
} from "@/features/billing/billing-plan-display";
import { useCurrentSubscription } from "@/features/billing/use-current-subscription";
import { useSubscriptionPlans } from "@/features/billing/use-subscription-plans";
import type { SubscriptionPlanRow } from "@/lib/api/types";

function findPlanBySlug(
  plans: SubscriptionPlanRow[],
  slug: string,
): SubscriptionPlanRow | undefined {
  return plans.find((plan) => plan.slug === slug);
}

export function BillingSettingsContent() {
  const subscription = useCurrentSubscription();
  const plans = useSubscriptionPlans();

  if (subscription.isLoading) {
    return <LoadingState label="Loading membership details..." />;
  }

  if (subscription.isError) {
    return (
      <div className="min-w-0 max-w-full space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Billing</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your current membership, payments, and subscription.
          </p>
        </div>
        <InlineAlert tone="error">
          We couldn&apos;t load your membership right now.
        </InlineAlert>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          onClick={() => void subscription.refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  const currentSlug = subscription.data?.plan_slug ?? "free";
  const planName = subscription.data?.plan_name ?? "Free";
  const planRows = plans.data?.plans ?? [];
  const matchedPlan = findPlanBySlug(planRows, currentSlug);
  const features =
    subscription.data?.features && subscription.data.features.length > 0
      ? subscription.data.features
      : matchedPlan
        ? getPlanFeatures(matchedPlan)
        : getFeaturesForSlug(currentSlug);

  const tagline = matchedPlan ? getPlanTagline(matchedPlan) : null;
  const renewsAt = formatBillingDate(subscription.data?.renews_at);
  const endsAt = formatBillingDate(subscription.data?.ends_at);
  const billingInterval = subscription.data?.billing_interval;
  const upgradeLabel = getSettingsUpgradeLabel(currentSlug);

  return (
    <div className="min-w-0 max-w-full space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">Billing</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your current membership, payments, and subscription.
        </p>
      </div>

      <section className="min-w-0 max-w-full break-words rounded-xl border border-border bg-card p-5 leading-relaxed">
        <h3 className="text-sm font-medium text-muted-foreground">Current membership</h3>
        <p className="mt-2 text-base text-foreground">
          You are currently on the <span className="font-semibold">{planName}</span> plan.
        </p>

        <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {matchedPlan ? (
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              {formatPrice(matchedPlan.monthly_price, matchedPlan.currency)}
              <span className="ml-1 text-sm font-normal text-muted-foreground">/ month</span>
            </p>
          ) : plans.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading price…</p>
          ) : (
            <p className="text-2xl font-semibold tabular-nums text-foreground">—</p>
          )}

          {subscription.data?.status ? (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {formatPlanStatus(subscription.data.status)}
            </span>
          ) : null}
        </div>

        {tagline ? <p className="mt-2 text-sm text-muted-foreground">{tagline}</p> : null}

        {billingInterval ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Billing interval:{" "}
            <span className="font-medium text-foreground capitalize">{billingInterval}</span>
          </p>
        ) : null}

        {renewsAt ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Renews on <span className="font-medium text-foreground">{renewsAt}</span>
          </p>
        ) : null}

        {!renewsAt && endsAt ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Expires on <span className="font-medium text-foreground">{endsAt}</span>
          </p>
        ) : null}

        {features.length > 0 ? (
          <div className="mt-5">
            <p className="text-sm font-medium text-foreground">Included:</p>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              {features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span aria-hidden className="shrink-0 text-primary">
                    •
                  </span>
                  <span className="min-w-0 break-words">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-5 space-y-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
          <p>{COMPLIANCE_FOOTNOTES.card}</p>
          <p>{COMPLIANCE_FOOTNOTES.cashback}</p>
          <p>{COMPLIANCE_FOOTNOTES.yield}</p>
          <p>{COMPLIANCE_FOOTNOTES.credit}</p>
        </div>

        <div className="mt-6">
          <Link
            href="/settings/billing/upgrade"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {upgradeLabel}
          </Link>
        </div>
      </section>
    </div>
  );
}
