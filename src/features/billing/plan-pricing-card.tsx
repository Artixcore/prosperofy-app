"use client";

import type { BillingInterval, PlanCtaState } from "@/features/billing/billing-plan-display";
import {
  formatFeatureBadge,
  formatPrice,
  getPlanFeatures,
  getPlanPrice,
  getPlanTagline,
  isCurrentPlan,
  isRecommendedPlan,
} from "@/features/billing/billing-plan-display";
import type { SubscriptionPlanRow } from "@/lib/api/types";

type PlanPricingCardProps = {
  plan: SubscriptionPlanRow;
  currentSlug: string;
  billingInterval: BillingInterval;
  ctaState: PlanCtaState;
  isBusy: boolean;
  onCheckout: (plan: SubscriptionPlanRow) => void;
};

function badgeClassName(badge: ReturnType<typeof formatFeatureBadge>): string {
  if (badge === "Coming soon") {
    return "bg-muted text-muted-foreground";
  }
  if (badge === "Where supported") {
    return "bg-blue-500/10 text-blue-700 dark:text-blue-300";
  }
  if (badge === "Eligible") {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }
  return "bg-primary/10 text-primary";
}

export function PlanPricingCard({
  plan,
  currentSlug,
  billingInterval,
  ctaState,
  isBusy,
  onCheckout,
}: PlanPricingCardProps) {
  const isCurrent = isCurrentPlan(plan, currentSlug);
  const isRecommended = isRecommendedPlan(plan);
  const tagline = getPlanTagline(plan);
  const features = getPlanFeatures(plan);
  const { amount, suffix } = getPlanPrice(plan, billingInterval);

  return (
    <section
      className={`flex min-w-0 flex-col break-words rounded-xl border bg-card p-5 leading-relaxed ${
        isCurrent ? "border-primary ring-2 ring-primary/30" : "border-border"
      }`}
      aria-labelledby={`plan-${plan.slug}-name`}
    >
      <div className="flex flex-wrap items-start gap-2">
        <h2 id={`plan-${plan.slug}-name`} className="text-lg font-semibold text-foreground">
          {plan.name}
        </h2>
        {isCurrent ? (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Current plan
          </span>
        ) : null}
        {!isCurrent && isRecommended ? (
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
            Recommended
          </span>
        ) : null}
      </div>

      {tagline ? (
        <p className="mt-2 text-sm text-muted-foreground">{tagline}</p>
      ) : null}

      <p className="mt-4 text-2xl font-semibold tabular-nums text-foreground">
        {formatPrice(amount, plan.currency)}
        <span className="ml-1 text-sm font-normal text-muted-foreground">{suffix}</span>
      </p>

      {features.length > 0 ? (
        <ul className="mt-4 flex-1 space-y-2 text-sm text-muted-foreground">
          {features.map((feature) => {
            const badge = formatFeatureBadge(feature, plan.metadata);
            return (
              <li key={feature} className="flex gap-2">
                <span aria-hidden className="shrink-0 text-primary">
                  •
                </span>
                <span className="min-w-0 flex-1 break-words">
                  <span>{feature}</span>
                  <span
                    className={`ml-2 inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium ${badgeClassName(badge)}`}
                  >
                    {badge}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}

      {ctaState.kind === "hidden" ? null : (
        <button
          type="button"
          className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          disabled={ctaState.kind === "disabled" || isBusy}
          onClick={() => {
            if (ctaState.kind === "action") {
              onCheckout(plan);
            }
          }}
        >
          {isBusy ? "Redirecting..." : ctaState.label}
        </button>
      )}
    </section>
  );
}
