import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const FORBIDDEN = ["api.tradewatch.io", "NEXT_PUBLIC_TRADEWATCH", "TRADEWATCH_API_KEY"];

function walkTsFiles(dir: string, out: string[]): void {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      walkTsFiles(p, out);
    } else if (/\.(tsx?|jsx?)$/.test(name)) {
      out.push(p);
    }
  }
}

describe("client bundle must not reference TradeWatch directly", () => {
  it("no forbidden substrings under src/", () => {
    const root = join(process.cwd(), "src");
    const files: string[] = [];
    walkTsFiles(root, files);
    expect(files.length).toBeGreaterThan(10);
    const hits: string[] = [];
    for (const f of files) {
      if (
        f.includes("no-tradewatch-in-client.test") ||
        f.includes("no-provider-keys-in-client.test")
      ) {
        continue;
      }
      const text = readFileSync(f, "utf8");
      for (const bad of FORBIDDEN) {
        if (text.includes(bad)) {
          hits.push(`${f}: contains ${bad}`);
        }
      }
    }
    expect(hits, hits.join("\n")).toEqual([]);
  });
});
