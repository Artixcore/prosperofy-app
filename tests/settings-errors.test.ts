import { describe, expect, it } from "vitest";
import { ApiClientError } from "@/lib/api/errors";
import { friendlySettingsError } from "@/lib/api/settings-errors";

describe("friendlySettingsError", () => {
  it("maps 401", () => {
    expect(
      friendlySettingsError(
        new ApiClientError("x", { status: 401, code: "AUTH", retryable: false }),
      ),
    ).toContain("session expired");
  });

  it("maps verification failures", () => {
    expect(
      friendlySettingsError(
        new ApiClientError("x", { status: 422, code: "VERIFICATION_FAILED", retryable: false }),
      ),
    ).toContain("verify your identity");
  });

  it("handles TypeError as network", () => {
    expect(friendlySettingsError(new TypeError("Failed to fetch"))).toContain("Network connection failed");
  });
});
