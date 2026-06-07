import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BinanceConnectionStatus } from "./binance-connection-status";
import type { ExchangeConnectionSummary } from "@/lib/api/types";

const baseConnection: ExchangeConnectionSummary = {
  id: "1",
  exchange: "binance",
  status: "connected",
  connection_mode: "portfolio_only",
};

describe("BinanceConnectionStatus", () => {
  it("shows Active badge for connected status", () => {
    render(<BinanceConnectionStatus connection={baseConnection} />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("shows Not verified yet when last_verified_at is missing", () => {
    render(<BinanceConnectionStatus connection={baseConnection} />);
    expect(screen.getByText("Not verified yet")).toBeInTheDocument();
    expect(screen.getByText("Not synced yet")).toBeInTheDocument();
  });

  it("renders long masked API key without crashing", () => {
    const longKey = "****" + "A".repeat(80);
    render(
      <BinanceConnectionStatus
        connection={{
          ...baseConnection,
          masked_api_key: longKey,
          last_verified_at: "2026-06-07T12:00:00.000Z",
        }}
      />
    );
    expect(screen.getByText(longKey)).toBeInTheDocument();
    expect(screen.getByText("Current connection")).toBeInTheDocument();
  });

  it("shows Portfolio only mode label", () => {
    render(<BinanceConnectionStatus connection={baseConnection} />);
    expect(screen.getByText("Portfolio only")).toBeInTheDocument();
  });
});
