export const SOLANA_SEND_ESTIMATED_FEE = "0.000005";
export const SOLANA_SEND_SAFETY_BUFFER = "0.00001";

const LAMPORTS_PER_SOL = BigInt("1000000000");

function parseSolToLamports(value: string): bigint | null {
  const trimmed = value.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    return null;
  }

  const [wholePart, fracPart = ""] = trimmed.split(".");
  const paddedFrac = (fracPart + "000000000").slice(0, 9);
  return BigInt(wholePart) * LAMPORTS_PER_SOL + BigInt(paddedFrac);
}

function lamportsToSolString(lamports: bigint): string {
  if (lamports <= BigInt(0)) {
    return "0";
  }

  const whole = lamports / LAMPORTS_PER_SOL;
  const frac = lamports % LAMPORTS_PER_SOL;
  if (frac === BigInt(0)) {
    return whole.toString();
  }

  const fracStr = frac.toString().padStart(9, "0").replace(/0+$/, "");
  return `${whole.toString()}.${fracStr}`;
}

/**
 * Returns the maximum SOL sendable after reserving fee + safety buffer,
 * or null when the balance cannot cover those costs.
 */
export function computeMaxSendableSol(
  balance: string,
  estimatedFee: string = SOLANA_SEND_ESTIMATED_FEE,
  safetyBuffer: string = SOLANA_SEND_SAFETY_BUFFER,
): string | null {
  const balanceLamports = parseSolToLamports(balance);
  const feeLamports = parseSolToLamports(estimatedFee);
  const bufferLamports = parseSolToLamports(safetyBuffer);

  if (balanceLamports === null || feeLamports === null || bufferLamports === null) {
    return null;
  }

  const maxLamports = balanceLamports - feeLamports - bufferLamports;
  if (maxLamports <= BigInt(0)) {
    return null;
  }

  return lamportsToSolString(maxLamports);
}

/** Trim trailing zeros for amount input display. */
export function formatMaxSendableForInput(max: string): string {
  const trimmed = max.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  return trimmed === "" ? "0" : trimmed;
}

/** True when amount exceeds max sendable (lamport-safe). */
export function isAmountAboveMaxSendable(
  amount: string,
  maxSendable: string | null,
): boolean {
  if (maxSendable === null) {
    return true;
  }

  const amountLamports = parseSolToLamports(amount);
  const maxLamports = parseSolToLamports(maxSendable);
  if (amountLamports === null || maxLamports === null) {
    return true;
  }

  return amountLamports > maxLamports;
}
