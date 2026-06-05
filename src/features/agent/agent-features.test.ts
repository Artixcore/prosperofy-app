import { describe, expect, it } from "vitest";
import { AGENT_DISCLAIMER } from "@/lib/config/agent-features";

describe("agent-features", () => {
  it("includes legal disclaimer text", () => {
    expect(AGENT_DISCLAIMER).toContain("not financial advice");
    expect(AGENT_DISCLAIMER).toContain("lose money");
  });
});
