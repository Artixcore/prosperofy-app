import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { YieldOverview, YieldPool } from "@/lib/api/types";
import { YieldPoolsSection } from "@/features/yield/components/yield-pools-section";

const overviewQuery = vi.fn();
const poolsQuery = vi.fn();
const allocationsQuery = vi.fn();
const earningsQuery = vi.fn();

vi.mock("@/features/yield/use-yield", () => ({
  useYieldOverviewQuery: () => overviewQuery(),
  useYieldPoolsQuery: () => poolsQuery(),
  useYieldAllocationsQuery: () => allocationsQuery(),
  useYieldEarningsQuery: () => earningsQuery(),
  useCreateYieldAllocationMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

const baseOverview: YieldOverview = {
  enabled: true,
  provider_enabled: false,
  save_wallet: { balance: "100.00", currency: "WFL", status: "ready" },
  summary: {
    total_allocated: "0.00",
    confirmed_earnings: "0.00",
    estimated_earnings: "0.00",
    currency: "WFL",
  },
  membership: { required: true, eligible: true, plan_name: "Premium" },
  risk_notice: "Yield pools involve smart contract, liquidity, and market risk.",
};

const samplePool: YieldPool = {
  id: "pool-1",
  name: "WFL Reserve",
  slug: "wfl-reserve",
  description: null,
  asset_symbol: "WFL",
  network: "WFL Network",
  status: "active",
  risk_level: "medium",
  apy_min: null,
  apy_max: null,
  apy_display: null,
  lockup_days: 30,
  auto_compound_supported: false,
  provider: "internal",
  allocate_enabled: false,
  disabled_reason: "Yield provider not enabled",
};

function mockQueries(
  overview: Partial<ReturnType<typeof overviewQuery>> = {},
  pools: Partial<ReturnType<typeof poolsQuery>> = {},
) {
  overviewQuery.mockReturnValue({
    isPending: false,
    isError: false,
    data: baseOverview,
    refetch: vi.fn(),
    ...overview,
  });
  poolsQuery.mockReturnValue({
    isPending: false,
    isError: false,
    data: { items: [samplePool] },
    ...pools,
  });
  allocationsQuery.mockReturnValue({
    isPending: false,
    isError: false,
    data: { items: [] },
  });
  earningsQuery.mockReturnValue({
    isPending: false,
    isError: false,
    data: { items: [] },
  });
}

describe("YieldPoolsSection", () => {
  it("shows yield section with provider-disabled messaging", () => {
    mockQueries();

    render(<YieldPoolsSection />);

    expect(screen.getByRole("heading", { name: "Yield Pools" })).toBeInTheDocument();
    expect(
      screen.getByText(/Yield allocations are not available yet/i),
    ).toBeInTheDocument();
    expect(screen.getByText("APY data unavailable")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Allocate" })).toBeDisabled();
    expect(screen.getByText("Yield provider not enabled")).toBeInTheDocument();
  });

  it("shows membership gate when user is not eligible", () => {
    mockQueries({
      data: {
        ...baseOverview,
        membership: { required: true, eligible: false, plan_name: "Free" },
      },
    });

    render(<YieldPoolsSection />);

    expect(
      screen.getByText("Your current membership does not include Yield Pools."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View membership plans" })).toHaveAttribute(
      "href",
      "/settings/billing/upgrade",
    );
  });

  it("does not show fake earnings when list is empty", () => {
    mockQueries();

    render(<YieldPoolsSection />);

    expect(screen.getByText("No yield earnings recorded yet.")).toBeInTheDocument();
    expect(screen.queryByText(/12\.5%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\+\s*100\.00/)).not.toBeInTheDocument();
  });

  it("opens allocation modal with risk disclosure when allocation is allowed", () => {
    mockQueries({
      data: {
        ...baseOverview,
        provider_enabled: true,
      },
    });

    poolsQuery.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        items: [{ ...samplePool, allocate_enabled: true, disabled_reason: null }],
      },
    });

    render(<YieldPoolsSection />);

    fireEvent.click(screen.getByRole("button", { name: "Allocate" }));

    expect(
      screen.getByText(/I understand yield pools involve risk and returns are not guaranteed/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm allocation" })).toBeDisabled();
  });
});
