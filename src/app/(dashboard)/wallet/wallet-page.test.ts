import { fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import WalletPage from "./page";

const createMock = vi.fn();

vi.mock("next/link", () => ({
  default: ({ children }: any) => children,
}));

vi.mock("@/features/wallets/use-wallet-mutations", () => ({
  useAppWalletOverviewQuery: () => ({
    isPending: false,
    isError: false,
    data: {
      wfl_wallet: null,
      connected_wallets: [],
      supported_chains: ["solana", "ethereum", "bitcoin"],
      recent_activity: [],
    },
    refetch: vi.fn(),
  }),
  useAppWalletChallengeMutation: () => ({ mutateAsync: vi.fn() }),
  useAppWalletConnectMutation: () => ({ mutateAsync: vi.fn() }),
  useCreateWflWalletMutation: () => ({ mutateAsync: createMock }),
}));

describe("wallet dashboard", () => {
  it("wallet dashboard renders", () => {
    render(createElement(WalletPage));
    expect(screen.getByText("Wallet")).toBeInTheDocument();
    expect(screen.getByText("Connect Phantom")).toBeInTheDocument();
  });

  it("create WFL wallet flow handles success", async () => {
    createMock.mockResolvedValueOnce({});
    render(createElement(WalletPage));
    fireEvent.click(screen.getAllByText("Create WFL Wallet")[0]);
    expect(await screen.findByText("WFL Wallet is ready.")).toBeInTheDocument();
  });

  it("create WFL wallet flow handles error", async () => {
    createMock.mockRejectedValueOnce(new Error("create failed"));
    render(createElement(WalletPage));
    fireEvent.click(screen.getAllByText("Create WFL Wallet")[0]);
    expect(await screen.findByText("create failed")).toBeInTheDocument();
  });
});
