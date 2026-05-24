import { describe, expect, it } from "vitest";
import {
  computeMaxSendableSol,
  formatMaxSendableForInput,
  isAmountAboveMaxSendable,
} from "./sol-send-limits";

describe("sol-send-limits", () => {
  it("computes max sendable for a typical balance", () => {
    expect(computeMaxSendableSol("0.011294989")).toBe("0.011279989");
  });

  it("returns null when balance cannot cover fee and buffer", () => {
    expect(computeMaxSendableSol("0.00001")).toBeNull();
    expect(computeMaxSendableSol("0.000014")).toBeNull();
  });

  it("formats max sendable for input", () => {
    expect(formatMaxSendableForInput("0.011279989")).toBe("0.011279989");
    expect(formatMaxSendableForInput("1.000000000")).toBe("1");
  });

  it("detects amount above max sendable", () => {
    const max = computeMaxSendableSol("0.011294989");
    expect(max).toBe("0.011279989");
    expect(isAmountAboveMaxSendable("0.011294989", max)).toBe(true);
    expect(isAmountAboveMaxSendable("0.0112", max)).toBe(false);
    expect(isAmountAboveMaxSendable("0.011279989", max)).toBe(false);
  });
});
