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

export type PaginationMeta = {
  current_page?: number;
  per_page?: number;
  total?: number;
  last_page?: number;
};

export type AppListResponse<T> = {
  items: T[];
  pagination?: PaginationMeta;
};

export type UserProfile = {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  theme_preference?: "light" | "dark" | "system";
  email_verified_at: string | null;
  role: string;
};

export type DashboardSummary = {
  activity: { hoursThisWeek: number };
  spending: { totalThisWeek: number; trend: Array<{ date: string; amount: number }> };
  virtualCard: {
    id: string | null;
    brand: string | null;
    currentBalance: number;
    maskedNumber: string | null;
    expiry: string | null;
  };
  contractType: { completionRate: number; completedCount: number };
  notifications: { unreadCount: number };
  totalBalance: number;
};

export type VirtualCard = {
  id: string;
  brand: string;
  holder_name: string;
  masked_number: string;
  last_four: string;
  expiry_month: string;
  expiry_year: string;
  current_balance: number;
  currency: string;
  is_active: boolean;
};

export type TransactionRecord = {
  id: string;
  type: "expense" | "income" | "transfer" | string;
  merchant: string | null;
  amount: number;
  currency: string;
  status: string;
  transacted_at: string;
  virtual_card_id: string | null;
  metadata: Record<string, unknown>;
};

export type ThemePreferencePayload = {
  theme_preference: "light" | "dark" | "system";
};

export type UserProfilePatchBody = {
  name?: string;
  avatar_url?: string | null;
};

export type UserSettingsNotifications = {
  email?: boolean;
  push?: boolean;
  marketing?: boolean;
};

export type UserSettings = {
  theme?: "light" | "dark" | "system";
  timezone?: string;
  notifications?: UserSettingsNotifications;
  risk_preference?: "low" | "medium" | "high";
  default_currency?: string;
};

export type UserSettingsPayload = {
  settings: UserSettings;
};

export type AppNotification = {
  id: string;
  type?: string;
  title?: string;
  body?: string | null;
  metadata?: Record<string, unknown>;
  read?: boolean;
  read_at?: string | null;
  created_at?: string;
};

export type MarkedCount = {
  marked: number;
};

export type ActivityItem = {
  id: string;
  kind?: string;
  action?: string;
  subject_type?: string | null;
  subject_id?: string | null;
  payload?: Record<string, unknown>;
  correlation_id?: string | null;
  created_at?: string;
};

export type StrategyRecord = {
  id: string;
  name: string;
  description?: string | null;
  market_type: "crypto" | "forex" | "stock" | "futures" | string;
  timeframe: string;
  source: "user" | "ai" | string;
  definition: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};

export type StrategyCreateBody = {
  name: string;
  description?: string | null;
  market_type: "crypto" | "forex" | "stock" | "futures";
  timeframe: string;
  source?: "user" | "ai";
  definition: Record<string, unknown>;
};

export type StrategyPatchBody = {
  name?: string;
  description?: string | null;
  market_type?: "crypto" | "forex" | "stock" | "futures";
  timeframe?: string;
  definition?: Record<string, unknown>;
};

/** Payload from `GET /api/app/dashboard` (subset used by the client dashboard). */
export type AppDashboardPayload = {
  profile: UserProfile;
  summary: {
    wallet_count: number;
    strategy_count: number;
    notification_unread_count: number;
    last_login_at: string | null;
  };
  overview: DashboardSummary;
  ledger_transactions: {
    items: TransactionRecord[];
    pagination: PaginationMeta;
  };
  wallets: ConnectedWallet[];
  activity: { items: ActivityItem[] };
  notifications: { unread_count: number; items: AppNotification[] };
  strategies: {
    items: StrategyRecord[];
    recent_evaluations: unknown[];
  };
  analytics: { weekly_activity: Array<{ date: string; count: number }> };
  widgets: Record<string, unknown>;
};
