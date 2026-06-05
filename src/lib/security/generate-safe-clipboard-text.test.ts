import { describe, expect, it } from "vitest";
import { generateSafeClipboardText, isSafeClipboardText } from "./generate-safe-clipboard-text";

describe("generateSafeClipboardText", () => {
  it("returns text with expected prefix and segment format", () => {
    const text = generateSafeClipboardText();
    expect(isSafeClipboardText(text)).toBe(true);
    expect(text).toMatch(/^PROSPEROFY_SAFE_CLIPBOARD_[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  });

  it("does not include user or API-like content", () => {
    const text = generateSafeClipboardText();
    expect(text.toLowerCase()).not.toContain("api");
    expect(text.toLowerCase()).not.toContain("secret");
    expect(text.toLowerCase()).not.toContain("binance");
  });
});
