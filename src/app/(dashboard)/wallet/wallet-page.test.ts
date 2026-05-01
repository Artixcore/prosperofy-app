import { fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/lib/api/errors";
import WalletPage from "./page";

const createMock = vi.fn();

const { challengeMutate, connectMutate } = vi.hoisted(() => ({
  challengeMutate: vi.fn(),
  connectMutate: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ children }: { children: ReactNode }) => children,
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
  useAppWalletChallengeMutation: () => ({ mutateAsync: challengeMutate, isPending: false }),
  useAppWalletConnectMutation: () => ({ mutateAsync: connectMutate, isPending: false }),
  useCreateWflWalletMutation: () => ({ mutateAsync: createMock }),
}));

vi.mock("@/components/system/toast-context", () => ({
  useToast: () => ({ pushToast: vi.fn() }),
}));

describe("wallet dashboard", () => {
  beforeEach(() => {
    challengeMutate.mockReset();
    connectMutate.mockReset();
  });

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
    expect(
      await screen.findByText("We could not process your request. Please try again."),
    ).toBeInTheDocument();
  });

  it("shows friendly copy when connect returns WALLET_CHALLENGE_INVALID", async () => {
    challengeMutate.mockResolvedValue({ challenge_id: 1, message: "Sign this message" });
    connectMutate.mockRejectedValue(
      new ApiClientError("ignored", {
        status: 422,
        code: "WALLET_CHALLENGE_INVALID",
        retryable: false,
      }),
    );
    (globalThis as { window: unknown }).window = {
      solana: {
        signMessage: vi.fn().mockResolvedValue({ signature: new Uint8Array(64) }),
        publicKey: { toString: () => "So11111111111111111111111111111111111111111" },
        connect: vi.fn(),
      },
    };

    render(createElement(WalletPage));
    fireEvent.click(screen.getAllByText("Connect Phantom")[0]);
    expect(
      await screen.findByText(
        "This wallet connection expired. Please reconnect your wallet and try again.",
      ),
    ).toBeInTheDocument();
  });
});
