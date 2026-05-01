import bs58 from "bs58";

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
  getNonce: (provider: "phantom") => Promise<{
    challenge_id?: number;
    nonce?: string;
    message?: string;
    signMessage?: string;
  }>,
  connectApi: (body: {
    challenge_id?: number;
    provider?: "phantom";
    chain?: "solana";
    message: string;
    signature: string;
    publicKey: string;
    network?: string;
    label?: string;
  }) => Promise<unknown>,
): Promise<void> {
  const sol = window.solana;
  if (!sol?.signMessage) {
    throw new Error("Phantom not available. Install the Phantom extension.");
  }

  const noncePayload = await getNonce("phantom");
  const message = signingMessageFromNonce(noncePayload);

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
    challenge_id: noncePayload.challenge_id,
    provider: "phantom",
    chain: "solana",
    message,
    signature,
    publicKey: pk,
  });
}

export async function connectMetaMaskFlow(
  getNonce: (provider: "metamask") => Promise<{
    challenge_id?: number;
    nonce?: string;
    message?: string;
    signMessage?: string;
  }>,
  connectApi: (body: {
    challenge_id?: number;
    provider?: "metamask";
    chain?: "ethereum";
    message: string;
    signature: string;
    address: string;
    network?: string;
    label?: string;
  }) => Promise<unknown>,
): Promise<void> {
  const eth = window.ethereum;
  if (!eth?.request) {
    throw new Error("MetaMask not available. Install MetaMask.");
  }

  const noncePayload = await getNonce("metamask");
  const message = signingMessageFromNonce(noncePayload);

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
    challenge_id: noncePayload.challenge_id,
    provider: "metamask",
    chain: "ethereum",
    message,
    signature,
    address,
  });
}
