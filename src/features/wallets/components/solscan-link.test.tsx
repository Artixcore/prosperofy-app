import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SolscanLink } from "./solscan-link";

describe("SolscanLink", () => {
  it("renders View on Solscan with rel noopener noreferrer", () => {
    render(
      <SolscanLink
        tx={{
          explorer_url: "https://solscan.io/tx/abc123",
          tx_hash: "abc123",
          network: "solana",
          explorer_name: "Solscan",
        }}
      />,
    );
    const link = screen.getByRole("link", { name: /view on solscan/i });
    expect(link).toHaveAttribute("href", "https://solscan.io/tx/abc123");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows explorer pending when tx_hash missing", () => {
    render(
      <SolscanLink
        tx={{
          explorer_url: null,
          tx_hash: null,
          network: "solana",
          explorer_name: "Solscan",
        }}
      />,
    );
    expect(screen.getByText("Explorer pending")).toBeInTheDocument();
  });

  it("detail variant shows unavailable message without hash", () => {
    render(
      <SolscanLink
        variant="detail"
        tx={{
          explorer_url: null,
          tx_hash: null,
          network: "solana",
          explorer_name: "Solscan",
        }}
      />,
    );
    expect(
      screen.getByText(/explorer link unavailable until transaction is broadcasted/i),
    ).toBeInTheDocument();
  });
});
