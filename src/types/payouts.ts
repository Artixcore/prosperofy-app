export type PayoutProfile = {
  has_profile: boolean;
  payout_currency: string;
  network: string;
  wallet_address_masked?: string;
  status?: string;
  last_verified_at?: string | null;
};

export type PayoutHistoryItem = {
  id: number;
  amount: string;
  currency: string;
  status: string;
  wallet_address_masked: string;
  network: string | null;
  created_at: string | null;
};

export type PayoutHistoryResponse = {
  items: PayoutHistoryItem[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};
