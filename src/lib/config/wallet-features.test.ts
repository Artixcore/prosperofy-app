import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { walletSendSolanaEnabled, walletSendSplEnabled } from "./wallet-features";

describe("wallet-features", () => {
  const prev = { ...process.env };

  beforeEach(() => {
    process.env = { ...prev };
  });

  afterEach(() => {
    process.env = { ...prev };
  });

  it("defaults Solana send to enabled when unset", () => {
    delete process.env.NEXT_PUBLIC_WALLET_SEND_SOLANA_ENABLED;
    expect(walletSendSolanaEnabled()).toBe(true);
  });

  it("disables Solana send when false", () => {
    process.env.NEXT_PUBLIC_WALLET_SEND_SOLANA_ENABLED = "false";
    expect(walletSendSolanaEnabled()).toBe(false);
  });

  it("SPL requires Solana flag", () => {
    process.env.NEXT_PUBLIC_WALLET_SEND_SOLANA_ENABLED = "false";
    process.env.NEXT_PUBLIC_WALLET_SEND_SPL_ENABLED = "true";
    expect(walletSendSplEnabled()).toBe(false);
  });

  it("SPL is off by default when unset", () => {
    delete process.env.NEXT_PUBLIC_WALLET_SEND_SPL_ENABLED;
    process.env.NEXT_PUBLIC_WALLET_SEND_SOLANA_ENABLED = "true";
    expect(walletSendSplEnabled()).toBe(false);
  });

  it("enables SPL only when explicitly true", () => {
    process.env.NEXT_PUBLIC_WALLET_SEND_SOLANA_ENABLED = "true";
    process.env.NEXT_PUBLIC_WALLET_SEND_SPL_ENABLED = "true";
    expect(walletSendSplEnabled()).toBe(true);
  });
});
