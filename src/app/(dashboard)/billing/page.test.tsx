import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/lib/api/errors";
import type { CurrentSubscription, SubscriptionPlanRow } from "@/lib/api/types";

const plansQuery = vi.fn();
const subscriptionQuery = vi.fn();
const checkoutMutate = vi.fn();
const locationAssign = vi.fn();

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

import { BillingSettingsContent } from "@/features/billing/billing-settings-content";
import { UpgradePlansContent } from "@/features/billing/upgrade-plans-content";

const mockPlans: SubscriptionPlanRow[] = [
  {
    id: 1,
    name: "Free",
    slug: "free",
    description: "Basic access",
    monthly_price: 0,
    yearly_price: 0,
    currency: "eur",
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
    monthly_price: 19,
    yearly_price: 190,
    currency: "eur",
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
    monthly_price: 49,
    yearly_price: 490,
    currency: "eur",
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
    monthly_price: 69,
    yearly_price: 690,
    currency: "eur",
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
    monthly_price: 129,
    yearly_price: 1290,
    currency: "eur",
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
    refetch: vi.fn(),
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
  locationAssign.mockReset();
  vi.stubGlobal("location", { href: "", assign: locationAssign });
});

describe("BillingSettingsContent", () => {
  it("renders current plan info without all plan cards", () => {
    render(<BillingSettingsContent />);
    expect(screen.getByRole("heading", { name: "Billing" })).toBeInTheDocument();
    expect(screen.getByText(/You are currently on the/i)).toBeInTheDocument();
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Starter" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Elite" })).not.toBeInTheDocument();
  });

  it("shows upgrade plan link for free users", () => {
    render(<BillingSettingsContent />);
    const upgradeLink = screen.getByRole("link", { name: "Upgrade plan" });
    expect(upgradeLink).toHaveAttribute("href", "/settings/billing/upgrade");
  });

  it("shows change plan link for paid users", () => {
    subscriptionQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      data: {
        ...mockSubscription,
        plan_slug: "trader",
        plan_name: "Trader",
        features: mockPlans[2].features,
      },
      refetch: vi.fn(),
    });
    render(<BillingSettingsContent />);
    expect(screen.getByRole("link", { name: "Change plan" })).toBeInTheDocument();
  });

  it("shows subscription error with retry", () => {
    const refetch = vi.fn();
    subscriptionQuery.mockReturnValue({
      isLoading: false,
      isError: true,
      error: new Error("fail"),
      data: null,
      refetch,
    });
    render(<BillingSettingsContent />);
    expect(
      screen.getByText(/We couldn't load your subscription right now/i),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(refetch).toHaveBeenCalled();
  });
});

describe("UpgradePlansContent", () => {
  it("renders five plan cards", () => {
    render(<UpgradePlansContent />);
    expect(screen.getByRole("heading", { name: "Choose your plan" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Free" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Starter" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Trader" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pro" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Elite" })).toBeInTheDocument();
  });

  it("shows current plan button for active plan", () => {
    render(<UpgradePlansContent />);
    const currentButtons = screen.getAllByRole("button", { name: "Current plan" });
    expect(currentButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("calls checkout endpoint on upgrade", async () => {
    render(<UpgradePlansContent />);
    const upgradeButtons = screen.getAllByRole("button", { name: "Upgrade" });
    fireEvent.click(upgradeButtons[0]);

    await waitFor(() => {
      expect(checkoutMutate).toHaveBeenCalledWith({
        plan_slug: "starter",
        billing_interval: "monthly",
        pay_currency: "usdttrc20",
      });
    });
  });

  it("redirects to payment_url on successful checkout", async () => {
    render(<UpgradePlansContent />);
    const upgradeButtons = screen.getAllByRole("button", { name: "Upgrade" });
    fireEvent.click(upgradeButtons[0]);

    await waitFor(() => {
      expect(locationAssign).toHaveBeenCalledWith(
        "https://nowpayments.io/payment/?iid=test",
      );
    });
    expect(locationAssign).toHaveBeenCalledTimes(1);
  });

  it("redirects when only invoice_url is returned", async () => {
    checkoutMutate.mockResolvedValueOnce({
      payment_id: 99,
      order_id: "prosperofy_test",
      payment_url: null,
      invoice_url: "https://nowpayments.io/payment/?iid=invoice-only",
      status: "pending",
    });

    render(<UpgradePlansContent />);
    fireEvent.click(screen.getAllByRole("button", { name: "Upgrade" })[0]);

    await waitFor(() => {
      expect(locationAssign).toHaveBeenCalledWith(
        "https://nowpayments.io/payment/?iid=invoice-only",
      );
    });
  });

  it("shows error when checkout succeeds without a payment link", async () => {
    checkoutMutate.mockResolvedValueOnce({
      payment_id: 99,
      order_id: "prosperofy_test",
      payment_url: null,
      status: "pending",
    });

    render(<UpgradePlansContent />);
    fireEvent.click(screen.getAllByRole("button", { name: "Upgrade" })[0]);

    await waitFor(() => {
      expect(
        screen.getByText(/no payment link was returned/i),
      ).toBeInTheDocument();
    });
    expect(locationAssign).not.toHaveBeenCalled();
  });

  it("shows mapped error for unavailable payment provider", async () => {
    checkoutMutate.mockRejectedValueOnce(
      new ApiClientError("Payment provider is temporarily unavailable.", {
        status: 503,
        code: "PAYMENT_PROVIDER_UNAVAILABLE",
        retryable: true,
      }),
    );

    render(<UpgradePlansContent />);
    fireEvent.click(screen.getAllByRole("button", { name: "Upgrade" })[0]);

    await waitFor(() => {
      expect(
        screen.getByText(/Payment provider is temporarily unavailable/i),
      ).toBeInTheDocument();
    });
  });

  it("does not call checkout for current plan button", async () => {
    render(<UpgradePlansContent />);
    const currentButtons = screen.getAllByRole("button", { name: "Current plan" });
    fireEvent.click(currentButtons[0]);
    expect(checkoutMutate).not.toHaveBeenCalled();
  });

  it("shows friendly checkout error message", async () => {
    checkoutMutate.mockRejectedValueOnce(new Error("provider exploded"));
    render(<UpgradePlansContent />);
    const upgradeButtons = screen.getAllByRole("button", { name: "Upgrade" });
    fireEvent.click(upgradeButtons[0]);

    await waitFor(() => {
      expect(
        screen.getByText(/We couldn't start checkout right now/i),
      ).toBeInTheDocument();
    });
    expect(screen.queryByText(/provider exploded/i)).not.toBeInTheDocument();
  });

  it("does not expose NOWPayments secrets in source", () => {
    const settingsSource = BillingSettingsContent.toString();
    const upgradeSource = UpgradePlansContent.toString();
    expect(settingsSource).not.toContain("NOWPAYMENTS_API_KEY");
    expect(settingsSource).not.toContain("NOWPAYMENTS_IPN_SECRET");
    expect(upgradeSource).not.toContain("NOWPAYMENTS_API_KEY");
    expect(upgradeSource).not.toContain("NOWPAYMENTS_IPN_SECRET");
  });
});
