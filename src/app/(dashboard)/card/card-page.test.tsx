import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProsperityCardPage from "./page";
import type { CardOverviewPayload } from "@/lib/api/types";

const overviewQuery = vi.fn();
const checkoutMutate = vi.fn();
const refreshMutate = vi.fn();
const locationAssign = vi.fn();

vi.mock("@/features/card/use-card-overview", () => ({
  useCardOverviewQuery: () => overviewQuery(),
  useCardCheckoutMutation: () => ({
    mutateAsync: checkoutMutate,
    isPending: false,
  }),
  useRefreshCardOrderMutation: () => ({
    mutateAsync: refreshMutate,
    isPending: false,
  }),
}));

const mockOverview: CardOverviewPayload = {
  enabled: true,
  card: {
    status: "not_requested",
    card_type: "virtual",
    fee_amount: "1.00",
    fee_currency: "USD",
    cashback_rate: "5.00",
    cashback_destination: "save_wallet",
    spend_wallet_required: true,
  },
  current_order: null,
  spend_wallet: {
    balance: "0.00",
    currency: "WFL",
    status: "ready",
  },
  membership: {
    required: false,
    eligible: true,
    plan_name: "Free",
  },
};

beforeEach(() => {
  overviewQuery.mockReturnValue({
    isLoading: false,
    isError: false,
    isFetching: false,
    data: mockOverview,
    refetch: vi.fn(),
  });
  checkoutMutate.mockReset();
  refreshMutate.mockReset();
  locationAssign.mockReset();
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { assign: locationAssign },
  });
});

describe("ProsperityCardPage", () => {
  it("loads overview and shows pay button", () => {
    render(<ProsperityCardPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Prosperity Card" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Pay \$1\.00 card fee/i })).toBeInTheDocument();
    expect(screen.getByText(/processed through NOWPayments/i)).toBeInTheDocument();
  });

  it("redirects to checkout url on pay", async () => {
    checkoutMutate.mockResolvedValue({
      checkout_url: "https://nowpayments.io/payment/?iid=test-card",
      order: { id: "order-1", status: "payment_pending" },
      payment: { id: 1, status: "pending" },
    });

    render(<ProsperityCardPage />);
    fireEvent.click(screen.getByRole("button", { name: /Pay \$1\.00 card fee/i }));

    await waitFor(() => {
      expect(checkoutMutate).toHaveBeenCalledWith({ pay_currency: "usdttrc20" });
      expect(locationAssign).toHaveBeenCalledWith(
        "https://nowpayments.io/payment/?iid=test-card",
      );
    });
  });

  it("does not show Gnosis Pay or mock labels", () => {
    render(<ProsperityCardPage />);
    expect(screen.queryByText(/Gnosis/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/demo/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/test mode/i)).not.toBeInTheDocument();
  });
});
