import bs58 from "bs58";
import type {
  MetaMaskConnectSignedBody,
  PhantomConnectSignedBody,
  WalletChallengeResponse,
} from "@/lib/api/types";

export const WALLET_CHALLENGE_EXPIRED_MESSAGE =
  "Wallet connection challenge expired. Please try again.";

/** Validates challenge id from Laravel before signing or calling `/wallet/connect`. */
export function requireWalletChallengeId(challenge_id: unknown): number {
  const n = typeof challenge_id === "number" ? challenge_id : Number(challenge_id);
  if (!Number.isFinite(n) || n < 1) {
    throw new Error(WALLET_CHALLENGE_EXPIRED_MESSAGE);
  }
  return n;
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

function signingMessageFromNonce(data: {
  message?: string;
  signMessage?: string;
}): string {
  const m = data.message ?? data.signMessage;
  if (!m || typeof m !== "string") {
    throw new Error("Wallet service did not return a message to sign.");
  }
  return m;
}

export async function connectPhantomFlow(
  fetchChallenge: (provider: "phantom") => Promise<WalletChallengeResponse>,
  connectApi: (body: PhantomConnectSignedBody) => Promise<unknown>,
): Promise<void> {
  const challengePayload = await fetchChallenge("phantom");
  const challenge_id = requireWalletChallengeId(challengePayload.challenge_id);
  const message = signingMessageFromNonce(challengePayload);

  const sol = window.solana;
  if (!sol?.signMessage) {
    throw new Error("Phantom not available. Install the Phantom extension.");
  }

  if (!sol.publicKey) {
    await sol.connect?.({ onlyIfTrusted: false });
  }
  const pk = sol.publicKey?.toString();
  if (!pk) throw new Error("Could not read Phantom public key.");

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

  await connectApi({
    challenge_id,
    provider: "phantom",
    chain: "solana",
    message,
    signature,
    publicKey: pk,
  });
}

export async function connectMetaMaskFlow(
  fetchChallenge: (provider: "metamask") => Promise<WalletChallengeResponse>,
  connectApi: (body: MetaMaskConnectSignedBody) => Promise<unknown>,
): Promise<void> {
  const challengePayload = await fetchChallenge("metamask");
  const challenge_id = requireWalletChallengeId(challengePayload.challenge_id);
  const message = signingMessageFromNonce(challengePayload);

  const eth = window.ethereum;
  if (!eth?.request) {
    throw new Error("MetaMask not available. Install MetaMask.");
  }

  const accounts = (await eth.request({
    method: "eth_requestAccounts",
  })) as string[];
  const address = accounts[0];
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error("No Ethereum account available.");
  }

  let signature: string;
  try {
    signature = (await eth.request({
      method: "personal_sign",
      params: [message, address],
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

  await connectApi({
    challenge_id,
    provider: "metamask",
    chain: "ethereum",
    message,
    signature,
    address,
  });
}
