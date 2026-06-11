import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { RewardsOverview } from "@/types/rewards";

const overviewQuery = vi.fn();
const referralsQuery = vi.fn();
const ledgerQuery = vi.fn();
const monthlyQuery = vi.fn();

vi.mock("@/components/system/toast-context", () => ({
  useToast: () => ({ pushToast: vi.fn() }),
}));

vi.mock("@/features/rewards/use-rewards", () => ({
  useRewardsOverview: () => overviewQuery(),
  useRewardsReferrals: () => referralsQuery(),
  useRewardsLedger: () => ledgerQuery(),
  useRewardsMonthlySummary: () => monthlyQuery(),
}));

vi.mock("@/features/rewards/use-payout-profile", () => ({
  usePayoutProfile: () => ({
    isPending: false,
    data: { has_profile: false, payout_currency: "usdttrc20", network: "trc20" },
  }),
  useSavePayoutProfile: () => ({ mutate: vi.fn(), isPending: false, isError: false, isSuccess: false }),
  usePayoutHistory: () => ({
    isPending: false,
    data: { items: [], pagination: { current_page: 1, per_page: 10, total: 0, last_page: 1 } },
  }),
}));

import RewardsPage from "./page";

const mockOverview: RewardsOverview = {
  referral: {
    code: "WFL-TEST-CODE",
    url: "https://app.prosperofy.com/register?ref=WFL-TEST-CODE",
  },
  summary: {
    total_invited: 0,
    active_members: 0,
    estimated_monthly_rewards: "0.00",
    pending_rewards: "0.00",
    approved_rewards: "0.00",
    paid_rewards: "0.00",
    currency: "EUR",
  },
  current_plan_reward_rate: {
    label: "Not available",
    rate_min: "0.00",
    rate_max: "0.00",
    note: "Rates depend on active membership and eligibility.",
  },
  recent_rewards: [],
};

function setupQueries(overview: Partial<typeof mockOverview> = {}) {
  overviewQuery.mockReturnValue({
    isPending: false,
    isError: false,
    fetchStatus: "idle",
    data: { ...mockOverview, ...overview },
    refetch: vi.fn(),
  });
  referralsQuery.mockReturnValue({
    isPending: false,
    data: { items: [], pagination: { current_page: 1, per_page: 20, total: 0, last_page: 1 } },
  });
  ledgerQuery.mockReturnValue({
    isPending: false,
    data: { items: [], pagination: { current_page: 1, per_page: 20, total: 0, last_page: 1 } },
  });
  monthlyQuery.mockReturnValue({
    isPending: false,
    data: { items: [] },
  });
}

describe("RewardsPage", () => {
  it("renders rewards center with referral link", () => {
    setupQueries();
    render(<RewardsPage />);

    expect(screen.getByRole("heading", { name: "Rewards Center" })).toBeInTheDocument();
    expect(screen.getByText("WFL-TEST-CODE")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy link" })).toBeInTheDocument();
  });

  it("shows empty state when no referrals", () => {
    setupQueries();
    render(<RewardsPage />);

    expect(screen.getByText("No referrals yet.")).toBeInTheDocument();
    expect(
      screen.getByText("Share your link to start building recurring membership rewards."),
    ).toBeInTheDocument();
  });

  it("shows summary cards", () => {
    setupQueries({
      summary: {
        ...mockOverview.summary,
        total_invited: 2,
        active_members: 1,
        estimated_monthly_rewards: "10.00",
      },
    });
    render(<RewardsPage />);

    expect(screen.getByText("Total invited")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Active members")).toBeInTheDocument();
    expect(screen.getByText("10.00 EUR")).toBeInTheDocument();
  });

  it("does not show raw user ids", () => {
    setupQueries();
    render(<RewardsPage />);

    expect(screen.queryByText(/user_id/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/subscription_id/i)).not.toBeInTheDocument();
  });

  it("renders payout profile form", () => {
    setupQueries();
    render(<RewardsPage />);

    expect(screen.getByRole("heading", { name: "Crypto payout profile" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save wallet" })).toBeInTheDocument();
  });
});
