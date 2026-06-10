import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/lib/api/errors";
import type { WalletControlCenterPayload, WalletOverview } from "@/lib/api/types";

const overviewQuery = vi.fn();
const controlCenterQuery = vi.fn();
const createMutate = vi.fn();
const refreshBalancesMutate = vi.fn();
const refreshBalancesState: { isPending: boolean } = { isPending: false };
const pushToast = vi.fn();
const routerPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/features/wallets/use-wallet-mutations", () => ({
  useAppWalletOverviewQuery: () => overviewQuery(),
  useWalletControlCenterQuery: () => controlCenterQuery(),
  useCreateWflWalletMutation: () => ({
    mutateAsync: createMutate,
    isPending: false,
  }),
  useRefreshWalletBalancesMutation: () => ({
    mutateAsync: refreshBalancesMutate,
    isPending: refreshBalancesState.isPending,
  }),
}));

vi.mock("@/components/system/toast-context", () => ({
  useToast: () => ({ pushToast }),
}));

import WalletPage from "./page";

function makeControlCenter(
  partial: Partial<WalletControlCenterPayload> = {},
): WalletControlCenterPayload {
  return {
    master_wallet: {
      id: "1",
      label: "Master WFL Wallet",
      address: "So11111111111111111111111111111111111111111",
      network: "WFL Network",
      status: "active",
      total_balance: "0.00",
      currency: "WFL",
      last_synced_at: null,
    },
    sub_wallets: [
      {
        type: "save",
        name: "Save Wallet",
        description: "For long-term savings, cashback, staking, and yield pools.",
        balance: "0.00",
        currency: "WFL",
        status: "ready",
        features: ["Cashback destination", "Yield pools coming soon", "Long-term savings"],
        actions: [
          { key: "add_funds", label: "Add funds", enabled: true },
          { key: "explore_yield", label: "Explore yield pools", enabled: false, reason: "Coming soon" },
        ],
      },
      {
        type: "invest",
        name: "Invest Wallet",
        description: "For AI-guided allocation ideas and investment strategy.",
        balance: "0.00",
        currency: "WFL",
        status: "ready",
        features: ["AI allocation ideas", "Portfolio strategy", "Risk insights"],
        actions: [
          { key: "view_ai_suggestions", label: "View AI suggestions", enabled: true },
          { key: "rebalance_idea", label: "Get rebalance idea", enabled: false, reason: "Coming soon" },
        ],
      },
      {
        type: "spend",
        name: "Spend Wallet",
        description: "For card top-ups and day-to-day spending.",
        balance: "0.00",
        currency: "WFL",
        status: "ready",
        features: ["Card top-up", "Daily spending", "Spending activity"],
        actions: [
          {
            key: "top_up_card",
            label: "Top up card",
            enabled: false,
            reason: "Card integration coming soon",
          },
          { key: "view_spending", label: "View spending", enabled: true },
        ],
      },
    ],
    recent_activity: [],
    ...partial,
  };
}

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

function setControlCenter(
  data: WalletControlCenterPayload,
  opts: { isError?: boolean; error?: unknown; isPending?: boolean } = {},
) {
  controlCenterQuery.mockReturnValue({
    isPending: opts.isPending ?? false,
    isFetching: false,
    isError: Boolean(opts.isError),
    error: opts.error ?? null,
    data: opts.isError ? undefined : data,
    refetch: vi.fn(),
  });
}

function setOverview(overview: WalletOverview) {
  overviewQuery.mockReturnValue({
    isPending: false,
    isFetching: false,
    isError: false,
    error: null,
    data: overview,
    refetch: vi.fn(),
  });
}

beforeEach(() => {
  overviewQuery.mockReset();
  controlCenterQuery.mockReset();
  createMutate.mockReset();
  refreshBalancesMutate.mockReset();
  routerPush.mockReset();
  refreshBalancesState.isPending = false;
  refreshBalancesMutate.mockResolvedValue({
    wallet: {
      id: 1,
      address: "So11111111111111111111111111111111111111111",
      network: "solana",
      asset: "SOL",
      balance_lamports: "0",
      balance_sol: "0",
      last_balance_synced_at: null,
    },
  });
  pushToast.mockReset();

  setOverview(makeOverview());
  setControlCenter(makeControlCenter());
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("WalletPage control center", () => {
  it("renders Wallet Control Center header and Refresh balances button", () => {
    render(<WalletPage />);
    expect(
      screen.getByRole("heading", { name: "Wallet Control Center" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Refresh balances/i }),
    ).toBeInTheDocument();
  });

  it("renders master wallet and three sub-wallet cards", () => {
    render(<WalletPage />);
    expect(screen.getByText("Master WFL Wallet")).toBeInTheDocument();
    expect(screen.getAllByText("Save Wallet").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Invest Wallet").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Spend Wallet").length).toBeGreaterThan(0);
  });

  it("shows friendly activity labels instead of raw event keys", () => {
    setControlCenter(
      makeControlCenter({
        recent_activity: [
          {
            id: 1,
            action: "wallet.assets.refresh",
            chain: null,
            created_at: "2026-06-07T17:07:00.000Z",
          },
        ],
      }),
    );
    render(<WalletPage />);
    expect(screen.getByText("Wallet balance refreshed")).toBeInTheDocument();
    expect(screen.queryByText("wallet.assets.refresh")).not.toBeInTheDocument();
  });

  it("shows coming-soon toast for disabled actions without navigating", () => {
    render(<WalletPage />);
    const yieldButtons = screen.getAllByRole("button", { name: /Explore yield pools/i });
    fireEvent.click(yieldButtons[0]!);

    expect(pushToast).toHaveBeenCalledWith(
      expect.objectContaining({
        tone: "info",
        title: "This feature is coming soon.",
      }),
    );
    expect(routerPush).not.toHaveBeenCalled();
  });

  it("routes enabled actions to safe destinations", () => {
    render(<WalletPage />);

    const addFundsButtons = screen.getAllByRole("button", { name: /^Add funds$/i });
    fireEvent.click(addFundsButtons[0]!);
    expect(routerPush).toHaveBeenCalledWith("/wallet/receive");

    const aiButtons = screen.getAllByRole("button", { name: /View AI suggestions/i });
    fireEvent.click(aiButtons[0]!);
    expect(routerPush).toHaveBeenCalledWith("/agent");

    const spendingButtons = screen.getAllByRole("button", { name: /View spending/i });
    fireEvent.click(spendingButtons[0]!);
    expect(routerPush).toHaveBeenCalledWith("/wallet/transactions");
  });

  it("renders error state when control center fails to load", () => {
    controlCenterQuery.mockReturnValue({
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
    expect(
      screen.getByText(/We couldn't load your wallet details right now/i),
    ).toBeInTheDocument();
  });

  it("clicking Refresh balances triggers balance refresh mutation", async () => {
    render(<WalletPage />);
    fireEvent.click(screen.getByRole("button", { name: /Refresh balances/i }));

    await waitFor(() => {
      expect(refreshBalancesMutate).toHaveBeenCalledWith({ force: true });
    });
    await waitFor(() => {
      expect(pushToast).toHaveBeenCalledWith(
        expect.objectContaining({ tone: "success", title: "Balances updated." }),
      );
    });
  });

  it("shows friendly toast when balance refresh fails", async () => {
    refreshBalancesMutate.mockRejectedValue(
      new ApiClientError("Wallet balances could not be refreshed.", {
        status: 502,
        code: "WALLET_SYNC_FAILED",
        retryable: true,
      }),
    );
    render(<WalletPage />);
    fireEvent.click(screen.getByRole("button", { name: /Refresh balances/i }));

    await waitFor(() => {
      expect(pushToast).toHaveBeenCalledWith(
        expect.objectContaining({
          tone: "error",
          title: "We couldn't refresh balances right now.",
        }),
      );
    });
  });

  it("when WFL wallet is missing, shows Activate CTA", () => {
    setOverview(makeOverview({ wfl_wallet: null }));
    render(<WalletPage />);
    expect(
      screen.getByRole("button", { name: /Activate WFL Wallet/i }),
    ).toBeInTheDocument();
  });

  it("when WFL wallet is pending, shows being-prepared banner", () => {
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
  });
});

describe("WalletPage bundle hygiene", () => {
  it("never references wallet-service URLs or secret env vars in the source it renders from", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const root = path.resolve(__dirname, "../../../..");
    const targets = [
      path.join(root, "src/app/(dashboard)/wallet/page.tsx"),
      path.join(root, "src/features/wallets/use-wallet-mutations.ts"),
      path.join(root, "src/lib/api/endpoints.ts"),
      path.join(root, "src/lib/api/wallet.ts"),
      path.join(root, "src/lib/api/types.ts"),
    ];
    const text = (await Promise.all(targets.map((p) => fs.readFile(p, "utf8")))).join("\n");

    expect(text).not.toMatch(/walletapi\.prosperofy\.com/);
    expect(text).not.toMatch(/NEXT_PUBLIC_WALLET_SERVICE/);
    expect(text).not.toMatch(/SERVICE_AUTH_KEY/);
    expect(text).not.toMatch(/WALLET_ENCRYPTION_KEY/);
    expect(text).not.toMatch(/SOLANA_PRIVATE_KEY/);
    expect(text).not.toMatch(/SEED_PHRASE/);
    expect(text).not.toMatch(/window\.solana/);
    expect(text).not.toMatch(/WalletConnect/);
    expect(text).not.toMatch(/MetaMask/);
    expect(text).not.toMatch(/Phantom/);
  });
});
