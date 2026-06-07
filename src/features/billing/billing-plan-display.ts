import type { SubscriptionPlanRow } from "@/lib/api/types";

export const PLAN_SLUG_ORDER = ["free", "starter", "trader", "pro", "elite"] as const;

export type PlanSlug = (typeof PLAN_SLUG_ORDER)[number];

export type BillingInterval = "monthly" | "yearly";

const PLAN_TAGLINES: Record<PlanSlug, string> = {
  free: "Basic access for getting started.",
  starter: "Beginner access with more tools.",
  trader: "Portfolio tools for active users.",
  pro: "Advanced tools and priority support.",
  elite: "Highest limits for power users.",
};

const PLAN_FEATURES: Record<PlanSlug, string[]> = {
  free: ["Basic dashboard", "Limited market overview", "Basic portfolio view"],
  starter: ["Everything in Free", "More tracked assets", "Basic market tools"],
  trader: [
    "Everything in Starter",
    "Portfolio tools",
    "More alerts",
    "Extended market access",
  ],
  pro: [
    "Everything in Trader",
    "Advanced market tools",
    "Higher usage limits",
    "Priority support",
  ],
  elite: [
    "Everything in Pro",
    "Highest limits",
    "Business/power user access",
    "First-priority support",
  ],
};

const RECOMMENDED_SLUGS = new Set<string>(["trader", "pro"]);

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

export function getPlanTierIndex(slug: string): number {
  const index = PLAN_SLUG_ORDER.indexOf(slug as PlanSlug);
  return index === -1 ? -1 : index;
}

export function isCurrentPlan(plan: SubscriptionPlanRow, currentSlug: string): boolean {
  return plan.slug === currentSlug;
}

export function isRecommendedPlan(slug: string): boolean {
  return RECOMMENDED_SLUGS.has(slug);
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
  | { kind: "action"; label: "Upgrade" | "Change plan" };

export function getPlanCtaState(
  plan: SubscriptionPlanRow,
  currentSlug: string,
): PlanCtaState {
  if (isCurrentPlan(plan, currentSlug)) {
    return { kind: "disabled", label: "Current plan" };
  }

  if (plan.slug === "free") {
    return currentSlug === "free"
      ? { kind: "disabled", label: "Current plan" }
      : { kind: "hidden" };
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
  return currentSlug === "free" ? "Upgrade plan" : "Change plan";
}
