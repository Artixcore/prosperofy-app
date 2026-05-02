import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const FORBIDDEN: RegExp[] = [/NEXT_PUBLIC_AI_/i, /NEXT_PUBLIC_[A-Z0-9_]*API_KEY/i, /NEXT_PUBLIC_[A-Z0-9_]*SECRET[A-Z0-9_]*/i];

function walkTsSources(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkTsSources(p, acc);
    else if (/\.(tsx?|jsx?|mjs|cjs)$/.test(name)) acc.push(p);
  }
  return acc;
}

function scanBuiltChunks(nextDir: string): string[] {
  const staticDir = join(nextDir, "static");
  if (!existsSync(staticDir)) return [];
  const chunks: string[] = [];
  function walk(d: string) {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      const st = statSync(p);
      if (st.isDirectory()) walk(p);
      else if (/\.js$/.test(name)) chunks.push(readFileSync(p, "utf8"));
    }
  }
  walk(staticDir);
  return chunks;
}

describe("No client AI/provider secrets in frontend bundle sources", () => {
  it("src/**/*.ts(x) must not contain forbidden NEXT_PUBLIC secret patterns", () => {
    const root = join(__dirname, "..", "src");
    const files = walkTsSources(root);
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const content = readFileSync(file, "utf8");
      for (const re of FORBIDDEN) {
        expect.soft(content, file).not.toMatch(re);
      }
    }
  });

  it("after next build, compiled chunks must not embed forbidden env keys", () => {
    const nextDir = join(__dirname, "..", ".next");
    const chunks = scanBuiltChunks(nextDir);
    if (!chunks.length) return;
    const haystack = chunks.join("\n");
    for (const re of FORBIDDEN) {
      expect.soft(haystack).not.toMatch(re);
    }
  });
});
