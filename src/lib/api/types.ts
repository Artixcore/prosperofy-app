export type AuthUser = {
  id: number;
  name: string;
  email: string;
};

export type AuthSuccessPayload = {
  user: AuthUser;
  token: string;
  token_type: string;
};

export type ConnectedWallet = {
  id: string;
  provider: string;
  address: string;
  chain_type: string;
  network: string | null;
  label: string | null;
  is_primary: boolean;
  last_verified_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type OrchestrationJob = {
  id: string;
  type: string;
  status: string;
  correlation_id: string | null;
  attempts: number;
  last_error?: string;
  created_at: string | null;
  updated_at: string | null;
  payload_summary: { symbol: string | null };
  result_summary?: {
    success: boolean | null;
    message: string | null;
  };
};

export type WalletNonceData = {
  nonce: string;
  message?: string;
  signMessage?: string;
  expiresAt?: string;
  id?: string;
};
