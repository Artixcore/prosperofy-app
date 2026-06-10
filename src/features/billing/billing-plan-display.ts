import type { PlanMetadata, SubscriptionPlanRow } from "@/lib/api/types";

export const PLAN_SLUG_ORDER = ["free", "starter", "trader", "pro", "elite"] as const;

export type PlanSlug = (typeof PLAN_SLUG_ORDER)[number];

export type BillingInterval = "monthly" | "yearly";

export type FeatureBadge = "Included" | "Eligible" | "Where supported" | "Coming soon";

const PLAN_TAGLINES: Record<PlanSlug, string> = {
  free: "Basic access for getting started.",
  starter: "Card eligibility and basic AI where supported.",
  trader: "Cashback eligibility and improved AI suggestions.",
  pro: "Yield pool access when available and advanced AI.",
  elite: "Highest limits and future credit eligibility.",
};

const PLAN_FEATURES: Record<PlanSlug, string[]> = {
  free: [
    "Save, Invest, and Spend wallet view",
    "Basic portfolio view",
    "Limited AI insights",
    "No card access",
    "No recurring rewards",
  ],
  starter: [
    "Everything in Free",
    "Card eligibility where supported",
    "Basic AI actions",
    "Basic referral access",
    "Limited rewards dashboard",
  ],
  trader: [
    "Everything in Starter",
    "Cashback eligibility (up to 5%, coming soon)",
    "Improved AI suggestions",
    "Referral rewards",
    "Higher wallet and activity limits",
  ],
  pro: [
    "Everything in Growth",
    "Yield pool access when available",
    "Advanced AI allocation ideas",
    "Higher referral and reward limits",
    "Priority support",
  ],
  elite: [
    "Everything in Premium",
    "Highest limits",
    "Advanced rewards",
    "Business and power user access",
    "Future credit eligibility where supported",
  ],
};

const RECOMMENDED_SLUGS = new Set<string>(["trader", "pro"]);

export const COMPLIANCE_FOOTNOTES = {
  card: "Card access is subject to supported countries and partner approval.",
  cashback:
    "Cashback rewards are planned and may vary by membership and region.",
  yield: "Yield pools are coming soon and involve risk.",
  credit: "Credit features are planned and subject to eligibility.",
} as const;

export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function formatPlanStatus(status: string): string {
  const normalized = status.trim().toLowerCase();
  if (normalized === "active") return "Active";
  if (normalized === "past_due") return "Past due";
  if (normalized === "canceled" || normalized === "cancelled") return "Canceled";
  if (normalized === "trialing") return "Trialing";
  if (normalized === "pending") return "Pending";
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
}

export function formatBillingDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function isPlanSlug(slug: string): slug is PlanSlug {
  return (PLAN_SLUG_ORDER as readonly string[]).includes(slug);
}

export function getPlanTagline(plan: SubscriptionPlanRow): string {
  if (plan.description?.trim()) return plan.description.trim();
  if (isPlanSlug(plan.slug)) return PLAN_TAGLINES[plan.slug];
  return "";
}

export function getPlanFeatures(plan: SubscriptionPlanRow): string[] {
  if (plan.features.length > 0) return plan.features;
  return getFeaturesForSlug(plan.slug);
}

export function getFeaturesForSlug(slug: string): string[] {
  if (isPlanSlug(slug)) return PLAN_FEATURES[slug];
  return [];
}

export function formatFeatureBadge(feature: string, metadata?: PlanMetadata): FeatureBadge {
  const lower = feature.toLowerCase();

  if (
    lower.includes("coming soon") ||
    lower.includes("planned") ||
    metadata?.yield_pools === "coming_soon" ||
    metadata?.cashback?.includes("coming_soon")
  ) {
    return "Coming soon";
  }

  if (
    lower.includes("where supported") ||
    lower.includes("subject to") ||
    lower.includes("eligibility") ||
    metadata?.card_access === "eligible_where_supported" ||
    metadata?.future_credit === "eligible_where_supported"
  ) {
    return "Where supported";
  }

  if (lower.includes("eligible") || metadata?.referral_rewards === "eligible") {
    return "Eligible";
  }

  return "Included";
}

export function getPlanTierIndex(slug: string): number {
  const index = PLAN_SLUG_ORDER.indexOf(slug as PlanSlug);
  return index === -1 ? -1 : index;
}

export function isCurrentPlan(plan: SubscriptionPlanRow, currentSlug: string): boolean {
  return plan.is_current ?? plan.slug === currentSlug;
}

export function isRecommendedPlan(plan: SubscriptionPlanRow): boolean {
  return plan.is_recommended ?? RECOMMENDED_SLUGS.has(plan.slug);
}

export function sortPlans(plans: SubscriptionPlanRow[]): SubscriptionPlanRow[] {
  return [...plans].sort((a, b) => a.sort_order - b.sort_order);
}

export function plansSupportYearly(plans: SubscriptionPlanRow[]): boolean {
  return plans.some((plan) => plan.billing_interval_support.includes("yearly"));
}

export function getPlanPrice(
  plan: SubscriptionPlanRow,
  interval: BillingInterval,
): { amount: number; suffix: string } {
  if (interval === "yearly" && plan.yearly_price != null) {
    return { amount: plan.yearly_price, suffix: "/ year" };
  }
  return { amount: plan.monthly_price, suffix: "/ month" };
}

export type PlanCtaState =
  | { kind: "hidden" }
  | { kind: "disabled"; label: "Current plan" }
  | { kind: "action"; label: "Upgrade" | "Change plan" | "Contact support" };

export function getPlanCtaState(
  plan: SubscriptionPlanRow,
  currentSlug: string,
): PlanCtaState {
  if (plan.cta_label === "Current plan" || isCurrentPlan(plan, currentSlug)) {
    return { kind: "disabled", label: "Current plan" };
  }

  if (plan.slug === "free") {
    return currentSlug === "free"
      ? { kind: "disabled", label: "Current plan" }
      : { kind: "hidden" };
  }

  if (plan.cta_label === "Contact support") {
    return { kind: "hidden" };
  }

  if (plan.cta_label === "Upgrade") {
    return { kind: "action", label: "Upgrade" };
  }

  if (plan.cta_label === "Change plan") {
    return { kind: "action", label: "Change plan" };
  }

  const planTier = getPlanTierIndex(plan.slug);
  const currentTier = getPlanTierIndex(currentSlug);

  if (planTier > currentTier) {
    return { kind: "action", label: "Upgrade" };
  }

  if (planTier < currentTier && planTier >= 0) {
    return { kind: "action", label: "Change plan" };
  }

  return { kind: "action", label: "Upgrade" };
}

export function getSettingsUpgradeLabel(currentSlug: string): string {
  return currentSlug === "free" ? "Upgrade membership" : "Change membership";
}
