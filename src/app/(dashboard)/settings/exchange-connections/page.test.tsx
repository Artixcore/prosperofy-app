import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ExchangeConnectionsPage from "./page";

vi.mock("@/features/exchanges/use-exchange-connections", () => ({
  useExchangeConnectionsQuery: () => ({
    isPending: false,
    isError: false,
    data: { connections: [], exchanges: [] },
    refetch: vi.fn(),
  }),
  useDeleteExchangeConnectionMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRevalidateExchangeConnectionMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("@/components/settings/exchange-connections/binance-connect-form", () => ({
  BinanceConnectForm: () => <div data-testid="binance-connect-form" />,
}));

describe("ExchangeConnectionsPage", () => {
  it("renders instructions and connect form", () => {
    render(<ExchangeConnectionsPage />);
    expect(screen.getByText("Exchange Connections")).toBeInTheDocument();
    expect(screen.getByText(/How to connect Binance safely/)).toBeInTheDocument();
    expect(screen.getByTestId("binance-connect-form")).toBeInTheDocument();
  });
});
