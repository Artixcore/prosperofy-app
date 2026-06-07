import { describe, expect, it } from "vitest";
import { ACTIVITY_LABELS, humanizeEventKey, resolveActivityDisplay } from "./activity-labels";

describe("activity-labels", () => {
  it("maps known event keys to friendly titles", () => {
    expect(ACTIVITY_LABELS["wallet.assets.refresh"].title).toBe("Wallet balance refreshed");
    expect(resolveActivityDisplay({ action: "wallet.assets.refresh" }).title).toBe(
      "Wallet balance refreshed",
    );
  });

  it("humanizes unknown event keys", () => {
    expect(humanizeEventKey("billing.payment.completed")).toBe("Billing Payment Completed");
    expect(resolveActivityDisplay({ action: "billing.payment.completed" }).title).toBe(
      "Payment completed",
    );
    expect(resolveActivityDisplay({ action: "custom.new.event" }).title).toBe("Custom New Event");
  });

  it("uses network in subtitle when chain is known", () => {
    const display = resolveActivityDisplay({
      action: "wallet.assets.refresh",
      chain: "solana",
      created_at: "2026-06-07T17:07:00.000Z",
    });
    expect(display.subtitle).toContain("Solana");
    expect(display.subtitle).not.toContain("Unknown network");
  });

  it("falls back to wallet activity when network is missing", () => {
    const display = resolveActivityDisplay({
      action: "wallet.assets.refresh",
      chain: null,
      created_at: "2026-06-07T17:07:00.000Z",
    });
    expect(display.subtitle).toContain("Wallet activity");
    expect(display.subtitle).not.toContain("Unknown network");
  });
});
