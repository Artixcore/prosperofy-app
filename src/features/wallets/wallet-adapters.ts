import bs58 from "bs58";
import type {
  MetaMaskConnectSignedBody,
  PhantomConnectSignedBody,
  WalletChallengeResponse,
} from "@/lib/api/types";

export const WALLET_CHALLENGE_EXPIRED_MESSAGE =
  "Wallet connection challenge expired. Please try again.";

export type AppWalletChallengePhantomBody = {
  provider: "phantom";
  chain: "solana";
  publicKey: string;
};

export type AppWalletChallengeMetaMaskBody = {
  provider: "metamask";
  chain: "ethereum";
  address: string;
};

/** Validates challenge id from Laravel before signing or calling `/wallet/connect`. */
export function requireWalletChallengeId(challenge_id: unknown): number {
  const n = typeof challenge_id === "number" ? challenge_id : Number(challenge_id);
  if (!Number.isFinite(n) || n < 1) {
    throw new Error(WALLET_CHALLENGE_EXPIRED_MESSAGE);
  }
  return n;
}

function shortenForLog(value: string): string {
  const v = value.trim();
  if (v.length <= 12) return v;
  return `${v.slice(0, 6)}…${v.slice(-4)}`;
}

function devWalletDebug(label: string, info: Record<string, unknown>): void {
  if (process.env.NODE_ENV !== "development") return;
  console.debug(`[wallet] ${label}`, info);
}

function isUserRejectedWalletError(e: unknown): boolean {
  if (!e || typeof e !== "object") return false;
  const o = e as { code?: number; message?: string };
  if (o.code === 4001) return true;
  const msg = String(o.message ?? "").toLowerCase();
  return (
    msg.includes("user rejected") ||
    msg.includes("user cancelled") ||
    msg.includes("user denied") ||
    msg.includes("cancelled")
  );
}

function signingMessageFromChallenge(data: {
  message?: string;
  signMessage?: string;
}): string {
  const m = data.message ?? data.signMessage;
  if (!m || typeof m !== "string" || !m.trim()) {
    throw new Error("Wallet service did not return a message to sign.");
  }
  return m;
}

/** EVM addresses: match Laravel normalization (lowercase hex). */
export function normalizeEthereumAddress(address: string): string {
  const t = address.trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(t)) {
    throw new Error("No Ethereum account available.");
  }
  return t.toLowerCase();
}

export async function connectPhantomFlow(
  fetchChallenge: (body: AppWalletChallengePhantomBody) => Promise<WalletChallengeResponse>,
  connectApi: (body: PhantomConnectSignedBody) => Promise<unknown>,
): Promise<void> {
  const sol = window.solana;
  if (!sol?.signMessage) {
    throw new Error("Phantom not available. Install the Phantom extension.");
  }

  if (!sol.publicKey) {
    await sol.connect?.({ onlyIfTrusted: false });
  }
  const pkAtStart = sol.publicKey?.toString();
  if (!pkAtStart) throw new Error("Could not read Phantom public key.");

  const challengePayload = await fetchChallenge({
    provider: "phantom",
    chain: "solana",
    publicKey: pkAtStart,
  });
  const challenge_id = requireWalletChallengeId(challengePayload.challenge_id);
  const message = signingMessageFromChallenge(challengePayload);

  devWalletDebug("phantom_challenge", {
    provider: "phantom",
    chain: "solana",
    addressShort: shortenForLog(pkAtStart),
    challengeIdPresent: true,
    messageLength: message.length,
  });

  const pkAfter = sol.publicKey?.toString();
  if (!pkAfter || pkAfter !== pkAtStart) {
    throw new Error("Wallet account changed during connection. Please try again.");
  }

  const encoded = new TextEncoder().encode(message);
  let signed;
  try {
    signed = await sol.signMessage(encoded);
  } catch (e: unknown) {
    if (isUserRejectedWalletError(e)) {
      throw new Error("Wallet signing was cancelled.");
    }
    throw e;
  }
  const signature = bs58.encode(signed.signature);

  devWalletDebug("phantom_connect", {
    challengeIdPresent: true,
    signatureLength: signature.length,
  });

  await connectApi({
    challenge_id,
    provider: "phantom",
    chain: "solana",
    message,
    signature,
    publicKey: pkAfter,
  });
}

export async function connectMetaMaskFlow(
  fetchChallenge: (body: AppWalletChallengeMetaMaskBody) => Promise<WalletChallengeResponse>,
  connectApi: (body: MetaMaskConnectSignedBody) => Promise<unknown>,
): Promise<void> {
  const eth = window.ethereum;
  if (!eth?.request) {
    throw new Error("MetaMask not available. Install MetaMask.");
  }

  const accounts = (await eth.request({
    method: "eth_requestAccounts",
  })) as string[];
  const rawAddress = accounts[0];
  if (!rawAddress || !/^0x[a-fA-F0-9]{40}$/.test(rawAddress)) {
    throw new Error("No Ethereum account available.");
  }
  const addressForChallenge = normalizeEthereumAddress(rawAddress);

  const challengePayload = await fetchChallenge({
    provider: "metamask",
    chain: "ethereum",
    address: addressForChallenge,
  });
  const challenge_id = requireWalletChallengeId(challengePayload.challenge_id);
  const message = signingMessageFromChallenge(challengePayload);

  devWalletDebug("metamask_challenge", {
    provider: "metamask",
    chain: "ethereum",
    addressShort: shortenForLog(addressForChallenge),
    challengeIdPresent: true,
    messageLength: message.length,
  });

  const accountsAgain = (await eth.request({
    method: "eth_accounts",
  })) as string[];
  const active = accountsAgain[0];
  if (!active || normalizeEthereumAddress(active) !== addressForChallenge) {
    throw new Error("Wallet account changed during connection. Please try again.");
  }

  let signature: string;
  try {
    signature = (await eth.request({
      method: "personal_sign",
      params: [message, active],
    })) as string;
  } catch (e: unknown) {
    if (isUserRejectedWalletError(e)) {
      throw new Error("Wallet signing was cancelled.");
    }
    throw e;
  }

  if (!/^0x[a-fA-F0-9]+$/.test(signature)) {
    throw new Error("Unexpected signature format from wallet.");
  }

  devWalletDebug("metamask_connect", {
    challengeIdPresent: true,
    signatureLength: signature.length,
  });

  await connectApi({
    challenge_id,
    provider: "metamask",
    chain: "ethereum",
    message,
    signature,
    address: normalizeEthereumAddress(active),
  });
}
