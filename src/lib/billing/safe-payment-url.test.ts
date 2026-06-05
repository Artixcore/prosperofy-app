import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isSafePaymentRedirectUrl } from "./safe-payment-url";

describe("isSafePaymentRedirectUrl", () => {
  beforeEach(() => {
    vi.stubEnv(
      "NEXT_PUBLIC_PAYMENT_REDIRECT_HOST_SUFFIXES",
      ".nowpayments.io,.nowpayments.com",
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts https checkout URLs on configured hosts", () => {
    expect(
      isSafePaymentRedirectUrl("https://nowpayments.io/payment/?iid=inv-abc"),
    ).toBe(true);
  });

  it("rejects http and unknown hosts", () => {
    expect(isSafePaymentRedirectUrl("http://nowpayments.io/pay")).toBe(false);
    expect(isSafePaymentRedirectUrl("https://evil.example/phish")).toBe(false);
  });

  it("rejects when allowlist env is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_PAYMENT_REDIRECT_HOST_SUFFIXES", "");
    expect(isSafePaymentRedirectUrl("https://nowpayments.io/pay")).toBe(false);
  });
});
