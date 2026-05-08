"use client";

import type { WalletAssetItem, WalletOverview } from "@/lib/api/types";

const SOL_SYMBOL = "SOL";
const EMPTY_SOL_BALANCE = "0.000000000";

type SolBalance = {
  balance: string;
  symbol: typeof SOL_SYMBOL;
};

function normalizeSymbol(symbol: string | null | undefined): string {
  return (symbol ?? "").trim().toUpperCase();
}

function pickRawBalance(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function readSolFromAssets(assets: WalletAssetItem[] | null | undefined): string | null {
  if (!assets || assets.length === 0) return null;
  for (const asset of assets) {
    if (normalizeSymbol(asset.symbol) !== SOL_SYMBOL) continue;
    const raw = pickRawBalance(asset.balance ?? asset.balance_cache ?? null);
    if (raw) return raw;
  }
  return null;
}

/**
 * Canonical SOL balance selector for wallet UI surfaces (navbar + wallet page).
 * Priority:
 * 1. `summary.native_breakdown` SOL row from overview.
 * 2. SOL row from wallet assets payload.
 * 3. SOL row from overview.assets fallback.
 * 4. Zero SOL.
 */
export function resolveSolBalance(
  overview: WalletOverview | null | undefined,
  assets?: WalletAssetItem[] | null,
): SolBalance {
  const breakdown = overview?.summary?.native_breakdown ?? [];
  for (const row of breakdown) {
    if (normalizeSymbol(row.symbol) !== SOL_SYMBOL) continue;
    const raw = pickRawBalance(row.balance);
    if (raw) return { balance: raw, symbol: SOL_SYMBOL };
  }

  const fromAssets = readSolFromAssets(assets);
  if (fromAssets) return { balance: fromAssets, symbol: SOL_SYMBOL };

  const fromOverviewAssets = readSolFromAssets(overview?.assets ?? null);
  if (fromOverviewAssets) return { balance: fromOverviewAssets, symbol: SOL_SYMBOL };

  return { balance: EMPTY_SOL_BALANCE, symbol: SOL_SYMBOL };
}
