import { describe, expect, it } from "vitest";
import { API } from "./endpoints";

describe("API.app core paths", () => {
  it("exposes wallet and market endpoints only under /api/app", () => {
    expect(API.app.wallet.overview).toBe("/api/app/wallet");
    expect(API.app.market.quote).toBe("/api/app/market/quote");
    expect(API.app.strategies.list).toBe("/api/app/strategies");
  });

  it("does not define removed AI or PA endpoints", () => {
    const serialized = JSON.stringify(API.app);
    expect(serialized).not.toContain("/api/app/pa/");
    expect(serialized).not.toContain("/api/app/agents");
    expect(serialized).not.toContain("/api/app/v1/");
  });
});
