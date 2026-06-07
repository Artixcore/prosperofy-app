import { describe, expect, it } from "vitest";
import type { BillingCheckoutResponse } from "@/lib/api/types";
import { resolveCheckoutUrl } from "./resolve-checkout-url";

describe("resolveCheckoutUrl", () => {
  it("prefers payment_url", () => {
    const data: BillingCheckoutResponse = {
      payment_id: 1,
      order_id: "order-1",
      payment_url: "https://nowpayments.io/payment/?iid=a",
      status: "pending",
    };
    expect(resolveCheckoutUrl(data)).toBe("https://nowpayments.io/payment/?iid=a");
  });

  it("falls back to invoice_url", () => {
    const data = {
      payment_id: 1,
      order_id: "order-1",
      payment_url: null,
      invoice_url: "https://nowpayments.io/payment/?iid=b",
      status: "pending",
    } as BillingCheckoutResponse;
    expect(resolveCheckoutUrl(data)).toBe("https://nowpayments.io/payment/?iid=b");
  });

  it("falls back to checkout_url and camelCase keys", () => {
    const data = {
      payment_id: 1,
      order_id: "order-1",
      payment_url: null,
      checkout_url: "https://nowpayments.io/payment/?iid=c",
      status: "pending",
    } as BillingCheckoutResponse;
    expect(resolveCheckoutUrl(data)).toBe("https://nowpayments.io/payment/?iid=c");

    const camel = {
      payment_id: 1,
      order_id: "order-1",
      payment_url: null,
      paymentUrl: "https://nowpayments.io/payment/?iid=d",
      status: "pending",
    } as BillingCheckoutResponse;
    expect(resolveCheckoutUrl(camel)).toBe("https://nowpayments.io/payment/?iid=d");
  });

  it("returns null when no URL keys are present", () => {
    const data: BillingCheckoutResponse = {
      payment_id: 1,
      order_id: "order-1",
      payment_url: null,
      status: "pending",
    };
    expect(resolveCheckoutUrl(data)).toBeNull();
  });
});
