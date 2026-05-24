import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ERROR_MESSAGES } from "../src/lib/api/error-catalog";

describe("error catalog parity", () => {
  it("frontend ERROR_MESSAGES matches Laravel export", () => {
    const exportPath = join(__dirname, "../src/lib/api/error-catalog.export.json");
    const exported = JSON.parse(readFileSync(exportPath, "utf8")) as {
      messages: Record<string, string>;
    };

    for (const [code, message] of Object.entries(exported.messages)) {
      expect(ERROR_MESSAGES[code], `missing frontend message for ${code}`).toBe(message);
    }
  });
});
