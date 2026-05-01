import { fireEvent, render, screen, within } from "@testing-library/react";
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

vi.mock("@/features/app/use-app-dashboard", () => ({
  useAppDashboardQuery: () => ({
    isPending: false,
    isError: false,
    data: {
      overview: { totalBalance: 0 },
    },
  }),
}));

const logoutMock = vi.fn();

vi.mock("@/lib/auth/session-context", () => ({
  useAuth: () => ({ user: { name: "Test User", email: "test@example.com" }, logout: logoutMock }),
}));

vi.mock("@/components/theme-toggle", () => ({
  ThemeToggle: ({ variant }: { variant?: string }) => (
    <button type="button" data-theme-variant={variant}>
      Theme
    </button>
  ),
}));

vi.mock("@/components/system/toast-context", () => ({
  useToast: () => ({ pushToast: vi.fn() }),
}));

describe("DashboardShell", () => {
  it("renders search, compact theme, wallet balance, and single-row toolbar", () => {
    const { container } = render(
      <DashboardShell>
        <div>Child</div>
      </DashboardShell>,
    );
    expect(screen.getByPlaceholderText("Search wallets, assets, agents...")).toBeInTheDocument();
    expect(screen.getByText("$0.00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Theme" })).toHaveAttribute("data-theme-variant", "compact");
    const toolbar = container.querySelector("header .flex.flex-nowrap");
    expect(toolbar).toBeTruthy();
  });

  it("opens user menu", () => {
    render(
      <DashboardShell>
        <div>Child</div>
      </DashboardShell>,
    );
    fireEvent.click(screen.getAllByRole("button", { name: /account menu for test user/i })[0]);
    const menu = screen.getAllByRole("menu")[0];
    expect(within(menu).getByRole("link", { name: "Profile" })).toBeInTheDocument();
    expect(within(menu).getByRole("menuitem", { name: "Logout" })).toBeInTheDocument();
  });

  it("opens mobile drawer", () => {
    render(
      <DashboardShell>
        <div>Child</div>
      </DashboardShell>,
    );
    fireEvent.click(screen.getAllByRole("button", { name: "Open navigation menu" })[0]);
    expect(screen.getAllByRole("button", { name: "Close menu" }).length).toBeGreaterThan(0);
  });

  it("toggles sidebar collapse button aria-expanded", () => {
    render(
      <DashboardShell>
        <div>Child</div>
      </DashboardShell>,
    );
    const collapse = screen.getAllByRole("button", { name: /collapse sidebar/i })[0];
    expect(collapse).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(collapse);
    expect(collapse).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(collapse);
    expect(collapse).toHaveAttribute("aria-expanded", "true");
  });

  it("applies collapsed width class to sidebar", () => {
    render(
      <DashboardShell>
        <div>Child</div>
      </DashboardShell>,
    );
    const sidebar = document.querySelector("#dashboard-sidebar");
    expect(sidebar).toBeTruthy();
    expect(sidebar).toHaveClass("w-60");
    fireEvent.click(screen.getAllByRole("button", { name: /collapse sidebar/i })[0]);
    expect(sidebar).toHaveClass("w-16");
  });
});
