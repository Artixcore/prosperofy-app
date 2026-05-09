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
const refreshAssetsMutate = vi.fn();
const refreshAssetsState: { isPending: boolean; data: unknown } = {
  isPending: false,
  data: undefined,
};
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
  useRefreshWalletAssetsMutation: () => ({
    mutateAsync: refreshAssetsMutate,
    isPending: refreshAssetsState.isPending,
    data: refreshAssetsState.data,
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
  refreshAssetsMutate.mockReset();
  refreshAssetsState.isPending = false;
  refreshAssetsState.data = undefined;
  pushToast.mockReset();

  assetsQuery.mockReturnValue({
    isPending: false,
    isFetching: false,
    data: { assets: [], last_synced_at: null },
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
  it("renders the dashboard skeleton with header and Refresh Balance button", () => {
    setOverview(makeOverview());
    render(<WalletPage />);
    expect(screen.getByRole("heading", { name: "Wallet" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Refresh Balance/i }),
    ).toBeInTheDocument();
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
    // Both the status banner and the balance-card badge surface a "setup failed"
    // message; we only need to confirm at least one is present.
    expect(screen.getAllByText(/setup failed/i).length).toBeGreaterThan(0);
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

  it("clicking Refresh Balance triggers the refresh mutation with force=true", async () => {
    refreshAssetsMutate.mockResolvedValueOnce({
      assets: [],
      last_synced_at: new Date().toISOString(),
      from_cache: false,
    });
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

    fireEvent.click(screen.getByRole("button", { name: /Refresh Balance/i }));

    await waitFor(() => {
      expect(refreshAssetsMutate).toHaveBeenCalledWith({ force: true });
    });
    await waitFor(() => {
      expect(pushToast).toHaveBeenCalledWith(
        expect.objectContaining({ tone: "success", title: "Balances refreshed" }),
      );
    });
  });

  it("shows a friendly toast and never raw error text when refresh fails", async () => {
    refreshAssetsMutate.mockRejectedValueOnce(
      new ApiClientError(
        "Solana network data is temporarily unavailable. Please try again shortly.",
        {
          status: 503,
          code: "WALLET_UPSTREAM_UNAVAILABLE",
          retryable: true,
        },
      ),
    );
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

    fireEvent.click(screen.getByRole("button", { name: /Refresh Balance/i }));

    await waitFor(() => {
      expect(pushToast).toHaveBeenCalledWith(
        expect.objectContaining({
          tone: "error",
          title: "Could not refresh balance",
          description: expect.stringMatching(/Solana network data is temporarily unavailable/i),
        }),
      );
    });

    expect(screen.queryByText(/\[object Object\]/)).not.toBeInTheDocument();
    // We never want the raw upstream error code or any wallet-service URLs in the DOM.
    expect(document.body.textContent ?? "").not.toMatch(/walletapi\.prosperofy\.com/);
    expect(document.body.textContent ?? "").not.toMatch(/INTERNAL_RPC/);
  });

  it("shows a balance-context error description, not 'Wallet connection failed', when the network is unreachable", async () => {
    refreshAssetsMutate.mockRejectedValueOnce(
      new ApiClientError("Could not reach the server. Please try again shortly.", {
        status: 0,
        code: "NETWORK_ERROR",
        retryable: true,
      }),
    );
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

    fireEvent.click(screen.getByRole("button", { name: /Refresh Balance/i }));

    await waitFor(() => {
      expect(pushToast).toHaveBeenCalledWith(
        expect.objectContaining({
          tone: "error",
          title: "Could not refresh balance",
          description: expect.stringMatching(/Could not reach the server/i),
        }),
      );
    });

    const lastCallDescription = (pushToast.mock.calls.at(-1)?.[0] as { description?: string })
      ?.description;
    expect(lastCallDescription ?? "").not.toMatch(/Wallet connection failed/i);
  });

  it("shows a wallet-balance-service description for WALLET_SYNC_FAILED", async () => {
    refreshAssetsMutate.mockRejectedValueOnce(
      new ApiClientError("Wallet balances could not be refreshed.", {
        status: 502,
        code: "WALLET_SYNC_FAILED",
        retryable: true,
      }),
    );
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

    fireEvent.click(screen.getByRole("button", { name: /Refresh Balance/i }));

    await waitFor(() => {
      expect(pushToast).toHaveBeenCalledWith(
        expect.objectContaining({
          tone: "error",
          title: "Could not refresh balance",
          description: expect.stringMatching(/Wallet balance service is temporarily unavailable/i),
        }),
      );
    });
  });

  it("renders native SOL headline when summary has no priced total but assets have a SOL balance", () => {
    assetsQuery.mockReturnValue({
      isPending: false,
      isFetching: false,
      data: {
        assets: [
          {
            id: 1,
            network: "solana",
            asset_type: "native",
            symbol: "SOL",
            name: "Solana",
            token_address: null,
            decimals: 9,
            balance: "0.011294989",
            raw_balance: "11294989",
            usd_value: null,
            price_usd: null,
            last_synced_at: new Date().toISOString(),
            chain: "solana",
            balance_cache: "0.011294989",
            token_standard: null,
          },
        ],
        last_synced_at: new Date().toISOString(),
      },
      refetch: vi.fn(),
    });

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
        // Backend has no USD price yet — frontend must fall back to native amount,
        // never display "0.00 USD" against a funded wallet.
        summary: { total_balance: null, currency: null },
        assets: [],
      }),
    );

    render(<WalletPage />);

    const headline = screen.getByTestId("wallet-balance-headline");
    expect(headline).toHaveTextContent("0.011294989");
    expect(screen.getAllByText(/SOL/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/USD value unavailable/i)).not.toBeInTheDocument();
    // Critical regression guard: the headline must NOT be the placeholder "0.00".
    expect(headline.textContent ?? "").not.toBe("0.00");
  });

  it("renders native SOL headline from summary.native_breakdown when provided, even before assets load", () => {
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
        summary: {
          total_balance: null,
          currency: null,
          native_breakdown: [
            { symbol: "SOL", balance: "0.011294989", network: "solana" },
          ],
        },
        assets: [],
      }),
    );

    render(<WalletPage />);

    const headline = screen.getByTestId("wallet-balance-headline");
    expect(headline).toHaveTextContent("0.011294989");
    expect(screen.queryByText(/USD value unavailable/i)).not.toBeInTheDocument();
  });

  it("renders SOL headline even when backend also supplies a priced USD summary", () => {
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
        summary: { total_balance: "1234.5", currency: "USD" },
        assets: [],
      }),
    );

    render(<WalletPage />);

    const headline = screen.getByTestId("wallet-balance-headline");
    expect(headline).toHaveTextContent("0.000000000");
    expect(screen.getAllByText(/SOL/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/USD value unavailable/i)).not.toBeInTheDocument();
  });

  it("renders the asset balance and last_synced_at relative time", () => {
    assetsQuery.mockReturnValue({
      isPending: false,
      isFetching: false,
      data: {
        assets: [
          {
            id: 1,
            network: "solana",
            asset_type: "native",
            symbol: "SOL",
            name: "Solana",
            token_address: null,
            decimals: 9,
            balance: "0.123456789",
            raw_balance: "123456789",
            last_synced_at: new Date().toISOString(),
            chain: "solana",
            balance_cache: "0.123456789",
            token_standard: null,
          },
        ],
        last_synced_at: new Date().toISOString(),
      },
      refetch: vi.fn(),
    });

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
    expect(screen.getAllByText("0.123456789").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Last synced/i)).toBeInTheDocument();
  });
});

describe("WalletPage bundle hygiene", () => {
  it("never references wallet-service URLs or secret env vars in the source it renders from", async () => {
    // Read the actual source files (not the mocked module graph) to assert that
    // no wallet-service base URL or secret env name slips into the frontend.
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const root = path.resolve(__dirname, "../../../..");
    const targets = [
      path.join(root, "src/app/(dashboard)/wallet/page.tsx"),
      path.join(root, "src/features/wallets/use-wallet-mutations.ts"),
      path.join(root, "src/lib/api/endpoints.ts"),
      path.join(root, "src/lib/api/types.ts"),
    ];
    const text = (await Promise.all(targets.map((p) => fs.readFile(p, "utf8")))).join("\n");

    expect(text).not.toMatch(/walletapi\.prosperofy\.com/);
    expect(text).not.toMatch(/NEXT_PUBLIC_WALLET_SERVICE/);
    expect(text).not.toMatch(/SERVICE_AUTH_KEY/);
    expect(text).not.toMatch(/WALLET_ENCRYPTION_KEY/);
    expect(text).not.toMatch(/SOLANA_PRIVATE_KEY/);
    expect(text).not.toMatch(/SEED_PHRASE/);
  });
});
