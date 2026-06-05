import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CurrentSubscription, SubscriptionPlanRow } from "@/lib/api/types";

const plansQuery = vi.fn();
const subscriptionQuery = vi.fn();
const checkoutMutate = vi.fn();

vi.mock("@/features/billing/use-subscription-plans", () => ({
  useSubscriptionPlans: () => plansQuery(),
}));

vi.mock("@/features/billing/use-current-subscription", () => ({
  useCurrentSubscription: () => subscriptionQuery(),
}));

vi.mock("@/features/billing/use-billing-checkout", () => ({
  useBillingCheckoutMutation: () => ({
    mutateAsync: checkoutMutate,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

import BillingPage from "./page";

const mockPlans: SubscriptionPlanRow[] = [
  {
    id: 1,
    name: "Free",
    slug: "free",
    description: "Basic access",
    monthly_price: 0,
    yearly_price: 0,
    currency: "usd",
    billing_interval_support: ["monthly"],
    features: ["Basic dashboard access"],
    limits: {
      watchlists: 1,
      tracked_assets: 5,
      alerts: 0,
      premium_market_data: false,
      priority_support: false,
    },
    sort_order: 0,
  },
  {
    id: 2,
    name: "Starter",
    slug: "starter",
    description: "Beginner paid",
    monthly_price: 9,
    yearly_price: 90,
    currency: "usd",
    billing_interval_support: ["monthly", "yearly"],
    features: ["Everything in Free", "Basic alerts"],
    limits: {
      watchlists: 3,
      tracked_assets: 25,
      alerts: 10,
      premium_market_data: false,
      priority_support: false,
    },
    sort_order: 1,
  },
  {
    id: 3,
    name: "Trader",
    slug: "trader",
    description: null,
    monthly_price: 19,
    yearly_price: 190,
    currency: "usd",
    billing_interval_support: ["monthly", "yearly"],
    features: ["Portfolio tools"],
    limits: {
      watchlists: 10,
      tracked_assets: 100,
      alerts: 50,
      premium_market_data: true,
      priority_support: false,
    },
    sort_order: 2,
  },
  {
    id: 4,
    name: "Pro",
    slug: "pro",
    description: null,
    monthly_price: 49,
    yearly_price: 490,
    currency: "usd",
    billing_interval_support: ["monthly", "yearly"],
    features: ["Priority support"],
    limits: {
      watchlists: 25,
      tracked_assets: 500,
      alerts: 200,
      premium_market_data: true,
      priority_support: true,
    },
    sort_order: 3,
  },
  {
    id: 5,
    name: "Elite",
    slug: "elite",
    description: null,
    monthly_price: 99,
    yearly_price: 990,
    currency: "usd",
    billing_interval_support: ["monthly", "yearly"],
    features: ["Highest limits"],
    limits: {
      watchlists: 100,
      tracked_assets: 2000,
      alerts: 1000,
      premium_market_data: true,
      priority_support: true,
    },
    sort_order: 4,
  },
];

const mockSubscription: CurrentSubscription = {
  subscription_id: null,
  plan_id: 1,
  plan_slug: "free",
  plan_name: "Free",
  status: "active",
  billing_interval: null,
  starts_at: null,
  renews_at: null,
  ends_at: null,
  limits: mockPlans[0].limits,
  features: mockPlans[0].features,
};

beforeEach(() => {
  vi.stubEnv(
    "NEXT_PUBLIC_PAYMENT_REDIRECT_HOST_SUFFIXES",
    ".nowpayments.io,.nowpayments.com",
  );
  vi.clearAllMocks();
  plansQuery.mockReturnValue({
    isLoading: false,
    isError: false,
    error: null,
    data: { plans: mockPlans },
  });
  subscriptionQuery.mockReturnValue({
    isLoading: false,
    isError: false,
    error: null,
    data: mockSubscription,
    refetch: vi.fn(),
  });
  checkoutMutate.mockResolvedValue({
    payment_id: 99,
    order_id: "prosperofy_test",
    payment_url: "https://nowpayments.io/payment/?iid=test",
    status: "pending",
  });
  vi.stubGlobal("location", { href: "" });
});

describe("BillingPage", () => {
  it("renders five plan cards", () => {
    render(<BillingPage />);
    expect(screen.getByRole("heading", { name: "Free" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Starter" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Trader" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pro" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Elite" })).toBeInTheDocument();
  });

  it("shows Current Plan for active plan", () => {
    render(<BillingPage />);
    const currentButtons = screen.getAllByRole("button", { name: "Current Plan" });
    expect(currentButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("calls Laravel checkout endpoint on subscribe", async () => {
    render(<BillingPage />);
    const subscribeButtons = screen.getAllByRole("button", { name: "Subscribe" });
    fireEvent.click(subscribeButtons[0]);

    await waitFor(() => {
      expect(checkoutMutate).toHaveBeenCalledWith({
        plan_slug: "starter",
        billing_interval: "monthly",
      });
    });
  });

  it("does not expose NOWPayments secrets in source", () => {
    const pageSource = BillingPage.toString();
    expect(pageSource).not.toContain("NOWPAYMENTS_API_KEY");
    expect(pageSource).not.toContain("NOWPAYMENTS_IPN_SECRET");
  });
});
