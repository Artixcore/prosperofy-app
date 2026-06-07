import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/** Host suffix allowlist for billing redirects — not direct provider API access. */
const BILLING_REDIRECT_ALLOWLIST_FILE = join(
  process.cwd(),
  "src/lib/billing/safe-payment-url.ts",
);

const FORBIDDEN = [
  "api.tradewatch.io",
  "api.binance.com",
  "api.coingecko.com",
  "walletapi.prosperofy.com",
  "aiapi.prosperofy.com",
  "newsdata.io",
  "api.mainnet-beta.solana.com",
  "SOLANA_RPC_URL",
  "NEXT_PUBLIC_SOLANA_RPC",
  "AI_SERVICE_KEY",
  "WALLET_SERVICE_KEY",
  "SERVICE_AUTH_KEY",
  "SERVICE_API_KEY",
  "NEWSDATA_API_KEY",
  "NEXT_PUBLIC_TRADEWATCH",
  "NEXT_PUBLIC_BINANCE",
  "NEXT_PUBLIC_COINGECKO",
  "TRADEWATCH_API_KEY",
  "BINANCE_API_KEY",
  "COINGECKO_API_KEY",
  "nowpayments.io",
  "NOWPAYMENTS_API_KEY",
  "NOWPAYMENTS_IPN_SECRET",
  "x-api-key",
];

function walkTsFiles(dir: string, out: string[]): void {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      walkTsFiles(p, out);
    } else if (/\.(tsx?|jsx?)$/.test(name) && !/\.(test|spec)\.(tsx?|jsx?)$/.test(name)) {
      out.push(p);
    }
  }
}

describe("client bundle must not reference market providers directly", () => {
  it("no forbidden substrings under src/", () => {
    const root = join(process.cwd(), "src");
    const files: string[] = [];
    walkTsFiles(root, files);
    expect(files.length).toBeGreaterThan(10);
    const hits: string[] = [];
    for (const f of files) {
      const text = readFileSync(f, "utf8");
      for (const bad of FORBIDDEN) {
        if (bad === "nowpayments.io" && f === BILLING_REDIRECT_ALLOWLIST_FILE) {
          continue;
        }
        if (text.includes(bad)) {
          hits.push(`${f}: contains ${bad}`);
        }
      }
    }
    expect(hits, hits.join("\n")).toEqual([]);
  });
});
