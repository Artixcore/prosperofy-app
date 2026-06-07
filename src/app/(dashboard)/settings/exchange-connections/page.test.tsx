import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import ExchangeConnectionsPage from "./page";

const revalidateMutateAsync = vi.fn();

vi.mock("@/features/exchanges/use-exchange-connections", () => ({
  useExchangeConnectionsQuery: () => ({
    isPending: false,
    isError: false,
    data: {
      connections: [
        {
          id: "1",
          exchange: "binance",
          provider: "binance",
          status: "connected",
          label: "spider",
        },
      ],
      exchanges: [],
    },
    refetch: vi.fn(),
  }),
  useDeleteExchangeConnectionMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRevalidateExchangeConnectionMutation: () => ({
    mutateAsync: revalidateMutateAsync,
    isPending: false,
  }),
  useExchangePortfolioQuery: () => ({
    isPending: false,
    isError: false,
    data: { balances: [] },
    refetch: vi.fn(),
  }),
}));

vi.mock("@/components/settings/exchange-connections/binance-connect-form", () => ({
  BinanceConnectForm: () => <div data-testid="binance-connect-form" />,
}));

vi.mock("@/components/settings/exchange-connections/binance-portfolio-preview", () => ({
  BinancePortfolioPreview: () => <div data-testid="binance-portfolio-preview" />,
}));

describe("ExchangeConnectionsPage", () => {
  beforeEach(() => {
    revalidateMutateAsync.mockReset();
    revalidateMutateAsync.mockResolvedValue({
      connection: { label: "spider", provider_account_uid: "123456789" },
      verified: true,
    });
  });

  it("renders instructions and connect form", () => {
    render(<ExchangeConnectionsPage />);
    expect(screen.getByText("Exchange Connections")).toBeInTheDocument();
    expect(screen.getByText(/How to connect Binance safely/)).toBeInTheDocument();
    expect(screen.getByTestId("binance-connect-form")).toBeInTheDocument();
  });

  it("does not call revalidate on mount", () => {
    render(<ExchangeConnectionsPage />);
    expect(revalidateMutateAsync).not.toHaveBeenCalled();
  });

  it("calls revalidate once when Revalidate is clicked", async () => {
    render(<ExchangeConnectionsPage />);
    fireEvent.click(screen.getByRole("button", { name: "Revalidate" }));
    expect(revalidateMutateAsync).toHaveBeenCalledTimes(1);
    expect(revalidateMutateAsync).toHaveBeenCalledWith("1");
  });
});
