import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CardSuccessPage from "./page";

const overviewQuery = vi.fn();

vi.mock("@/features/card/use-card-overview", () => ({
  useCardOverviewQuery: () => overviewQuery(),
}));

beforeEach(() => {
  overviewQuery.mockReturnValue({
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
    data: {
      enabled: true,
      card: {
        status: "payment_pending",
        card_type: "virtual",
        fee_amount: "1.00",
        fee_currency: "USD",
        cashback_rate: "5.00",
        cashback_destination: "save_wallet",
        spend_wallet_required: true,
      },
      current_order: null,
      spend_wallet: { balance: "0.00", currency: "WFL", status: "ready" },
      membership: { required: false, eligible: true, plan_name: "Free" },
    },
  });
});

describe("CardSuccessPage", () => {
  it("does not claim active before backend says active", () => {
    render(<CardSuccessPage />);
    expect(screen.getByText(/Payment submitted/i)).toBeInTheDocument();
    expect(screen.getByText(/payment pending/i)).toBeInTheDocument();
    expect(screen.queryByText(/Your Prosperity Card is active/i)).not.toBeInTheDocument();
  });
});
