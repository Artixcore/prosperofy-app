import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { DashboardShell } from "./dashboard-shell";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

vi.mock("@/features/app/use-notifications", () => ({
  useNotificationsQuery: () => ({ data: { pagination: { total: 0 }, items: [] } }),
}));

vi.mock("@/features/wallets/use-wallet-mutations", () => ({
  useAppWalletOverviewQuery: () => ({
    isPending: false,
    isError: false,
    data: {
      wfl_wallet: { status: "active", public_ethereum_address: "0x1234567890abcdef", public_solana_address: null, public_bitcoin_address: null },
    },
  }),
}));

const logoutMock = vi.fn();

vi.mock("@/lib/auth/session-context", () => ({
  useAuth: () => ({ user: { name: "Test User", email: "test@example.com" }, logout: logoutMock }),
}));

vi.mock("@/components/theme-toggle", () => ({
  ThemeToggle: () => <button type="button">Theme</button>,
}));

vi.mock("@/components/system/toast-context", () => ({
  useToast: () => ({ pushToast: vi.fn() }),
}));

describe("DashboardShell", () => {
  it("renders search and wallet badge", () => {
    render(<DashboardShell><div>Child</div></DashboardShell>);
    expect(screen.getByPlaceholderText("Search wallets, assets, agents...")).toBeInTheDocument();
    expect(screen.getByText("WFL Wallet")).toBeInTheDocument();
  });

  it("opens user menu", () => {
    render(<DashboardShell><div>Child</div></DashboardShell>);
    fireEvent.click(screen.getByRole("button", { name: /test user/i }));
    expect(screen.getByRole("menuitem", { name: "Profile" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Logout" })).toBeInTheDocument();
  });

  it("opens mobile drawer", () => {
    render(<DashboardShell><div>Child</div></DashboardShell>);
    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();
  });
});
