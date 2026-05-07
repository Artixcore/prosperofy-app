import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/lib/api/errors";
import type { WalletOverview } from "@/lib/api/types";

const overviewQuery = vi.fn();
const assetsQuery = vi.fn();
const transactionsQuery = vi.fn();
const challengeMutate = vi.fn();
const connectMutate = vi.fn();
const disconnectMutate = vi.fn();
const createMutate = vi.fn();
const pushToast = vi.fn();

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/features/wallets/use-wallet-mutations", () => ({
  useAppWalletOverviewQuery: () => overviewQuery(),
  useAppWalletAssetsQuery: () => assetsQuery(),
  useAppWalletChallengeMutation: () => ({ mutateAsync: challengeMutate, isPending: false }),
  useAppWalletConnectMutation: () => ({ mutateAsync: connectMutate, isPending: false }),
  useDisconnectConnectedWalletMutation: () => ({
    mutateAsync: disconnectMutate,
    isPending: false,
  }),
  useCreateWflWalletMutation: () => ({
    mutateAsync: createMutate,
    isPending: false,
  }),
}));

vi.mock("@/features/wallets/use-wallet-send", () => ({
  useWalletTransactionsQuery: () => transactionsQuery(),
}));

vi.mock("@/components/system/toast-context", () => ({
  useToast: () => ({ pushToast }),
}));

import WalletPage from "./page";

function makeOverview(partial: Partial<WalletOverview> = {}): WalletOverview {
  return {
    wfl_wallet: null,
    connected_wallets: [],
    supported_chains: ["solana", "ethereum", "bitcoin"],
    recent_activity: [],
    summary: { total_balance: "0.00", currency: "USD" },
    assets: [],
    ...partial,
  };
}

function setOverview(overview: WalletOverview, opts: { isError?: boolean; error?: unknown } = {}) {
  overviewQuery.mockReturnValue({
    isPending: false,
    isFetching: false,
    isError: Boolean(opts.isError),
    error: opts.error ?? null,
    data: opts.isError ? undefined : overview,
    refetch: vi.fn(),
  });
}

beforeEach(() => {
  overviewQuery.mockReset();
  assetsQuery.mockReset();
  transactionsQuery.mockReset();
  challengeMutate.mockReset();
  connectMutate.mockReset();
  disconnectMutate.mockReset();
  createMutate.mockReset();
  pushToast.mockReset();

  assetsQuery.mockReturnValue({
    isPending: false,
    isFetching: false,
    data: [],
    refetch: vi.fn(),
  });
  transactionsQuery.mockReturnValue({
    isPending: false,
    isError: false,
    data: { transactions: [], pagination: { total: 0, per_page: 5, current_page: 1, last_page: 1 } },
  });
});

afterEach(() => {
  delete (window as unknown as { solana?: unknown }).solana;
});

describe("WalletPage", () => {
  it("renders the dashboard skeleton with header and refresh", () => {
    setOverview(makeOverview());
    render(<WalletPage />);
    expect(screen.getByRole("heading", { name: "Wallet" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /refresh/i })).toBeInTheDocument();
  });

  it("when WFL wallet is active, hides Activate CTA and enables Receive/Send", () => {
    setOverview(
      makeOverview({
        wfl_wallet: {
          id: 1,
          wallet_type: "wfl_internal",
          status: "active",
          public_solana_address: "So11111111111111111111111111111111111111111",
          public_ethereum_address: null,
          public_bitcoin_address: null,
        },
      }),
    );
    render(<WalletPage />);
    expect(screen.queryByRole("button", { name: /Activate WFL Wallet/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Create WFL Wallet/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Receive/i })).toHaveAttribute(
      "href",
      "/wallet/receive",
    );
    expect(screen.getByRole("link", { name: /Send/i })).toHaveAttribute("href", "/wallet/send");
  });

  it("when WFL wallet is missing, shows Activate CTA and disables Send", () => {
    setOverview(makeOverview({ wfl_wallet: null }));
    render(<WalletPage />);
    expect(
      screen.getByRole("button", { name: /Activate WFL Wallet/i }),
    ).toBeInTheDocument();
    const sendButton = screen.getByRole("button", { name: /Send/i });
    expect(sendButton).toBeDisabled();
  });

  it("when WFL wallet is pending, shows being-prepared banner and disables Send", () => {
    setOverview(
      makeOverview({
        wfl_wallet: {
          id: 1,
          wallet_type: "wfl_internal",
          status: "pending",
          public_solana_address: null,
          public_ethereum_address: null,
          public_bitcoin_address: null,
        },
      }),
    );
    render(<WalletPage />);
    expect(screen.getByText(/being prepared/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Activate WFL Wallet/i }),
    ).not.toBeInTheDocument();
    const sendButton = screen.getByRole("button", { name: /Send/i });
    expect(sendButton).toBeDisabled();
  });

  it("when WFL wallet is failed, shows Activate CTA again", () => {
    setOverview(
      makeOverview({
        wfl_wallet: {
          id: 1,
          wallet_type: "wfl_internal",
          status: "failed",
          public_solana_address: null,
          public_ethereum_address: null,
          public_bitcoin_address: null,
        },
      }),
    );
    render(<WalletPage />);
    expect(
      screen.getByRole("button", { name: /Activate WFL Wallet/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/setup failed/i)).toBeInTheDocument();
  });

  it("Phantom not connected → shows Connect Phantom button", () => {
    setOverview(makeOverview({ connected_wallets: [] }));
    render(<WalletPage />);
    expect(
      screen.getByRole("button", { name: /Connect Phantom/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Remove Phantom/i }),
    ).not.toBeInTheDocument();
  });

  it("Phantom connected → shows Remove Phantom button and not Connect", () => {
    setOverview(
      makeOverview({
        connected_wallets: [
          {
            id: "42",
            provider: "phantom",
            address: "So11111111111111111111111111111111111111111",
            chain_type: "solana",
            network: null,
            label: null,
            is_primary: false,
            last_verified_at: "2024-01-01T00:00:00Z",
            created_at: null,
            updated_at: null,
          },
        ],
      }),
    );
    render(<WalletPage />);
    expect(
      screen.getByRole("button", { name: /Remove Phantom/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Connect Phantom/i }),
    ).not.toBeInTheDocument();
  });

  it("MetaMask not connected → shows Connect MetaMask button", () => {
    setOverview(makeOverview({ connected_wallets: [] }));
    render(<WalletPage />);
    expect(
      screen.getByRole("button", { name: /Connect MetaMask/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Remove MetaMask/i }),
    ).not.toBeInTheDocument();
  });

  it("removing a connected wallet calls the disconnect mutation through the confirm dialog", async () => {
    disconnectMutate.mockResolvedValueOnce({});
    setOverview(
      makeOverview({
        connected_wallets: [
          {
            id: "77",
            provider: "phantom",
            address: "So11111111111111111111111111111111111111111",
            chain_type: "solana",
            network: null,
            label: null,
            is_primary: false,
            last_verified_at: null,
            created_at: null,
            updated_at: null,
          },
        ],
      }),
    );
    render(<WalletPage />);
    fireEvent.click(screen.getByRole("button", { name: /Remove Phantom/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Remove$/i }));
    await waitFor(() => {
      expect(disconnectMutate).toHaveBeenCalledWith("77");
    });
  });

  it("renders ErrorState with friendly message on overview API failure", () => {
    overviewQuery.mockReturnValue({
      isPending: false,
      isFetching: false,
      isError: true,
      error: new ApiClientError("ignored", {
        status: 500,
        code: "SERVER_ERROR",
        retryable: true,
      }),
      data: undefined,
      refetch: vi.fn(),
    });
    render(<WalletPage />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText(/\[object Object\]/)).not.toBeInTheDocument();
  });

  it("renders empty assets and empty transactions states", () => {
    setOverview(
      makeOverview({
        wfl_wallet: {
          id: 1,
          wallet_type: "wfl_internal",
          status: "active",
          public_solana_address: "So11111111111111111111111111111111111111111",
          public_ethereum_address: null,
          public_bitcoin_address: null,
        },
      }),
    );
    render(<WalletPage />);
    expect(screen.getByText(/No assets found yet/i)).toBeInTheDocument();
    expect(screen.getByText(/No transactions yet/i)).toBeInTheDocument();
  });
});
