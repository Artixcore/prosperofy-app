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

/** Lifecycle of the WFL internal wallet on the user_wallets row. Backend may emit additional values, so consumers should treat the type as "string" for unknown values. */
export type WflWalletStatus = "active" | "pending" | "failed" | (string & {});

export type WalletOverview = {
  wfl_wallet: {
    id: number;
    wallet_type: string;
    status: WflWalletStatus;
    public_solana_address: string | null;
    public_ethereum_address: string | null;
    public_bitcoin_address: string | null;
  } | null;
  /**
   * True when the user must take action to activate or repair the WFL wallet
   * (no row exists, or the latest provisioning attempt failed). False when
   * the wallet is active or being prepared (`pending`).
   */
  wfl_wallet_required?: boolean;
  connected_wallets: ConnectedWallet[];
  supported_chains: string[];
  recent_activity: Array<{ id: number; action: string; chain: string | null; created_at: string }>;
  /** Alias of recent_activity for dashboard contracts */
  activity?: Array<{ id: number; action: string; chain: string | null; created_at: string }>;
  assets?: WalletAssetItem[];
  /** ISO8601 timestamp of the most recent on-chain balance sync, if any. */
  last_synced_at?: string | null;
  /**
   * Aggregated balance summary. When at least one asset has a numeric
   * `usd_value`, `total_balance` is the summed USD string and `currency`
   * is `"USD"`. When no asset carries a price, `total_balance` and
   * `currency` are both `null` and `native_breakdown` lists each asset's
   * native amount so the UI can render `<balance> <symbol>` with a
   * "USD value unavailable" subtitle. Never fabricated.
   */
  summary?: {
    total_usd?: string | null;
    total_balance?: string | null;
    currency: string | null;
    price_status?: "live" | "cached" | "partial" | "unavailable" | (string & {});
    native_breakdown?: Array<{
      symbol: string;
      balance: string;
      network: string | null;
    }>;
  };
};

export type WalletAssetItem = {
  id: number;
  /** Modern shape from the balance-sync flow. Always present for newly synced rows. */
  network?: string | null;
  asset_type?: "native" | "spl" | "erc20" | "btc" | (string & {}) | null;
  symbol: string;
  name?: string | null;
  token_address: string | null;
  decimals: number | null;
  balance?: string | null;
  raw_balance?: string | null;
  usd_value?: string | null;
  price_usd?: string | null;
  price_source?:
    | "coingecko"
    | "tradewatch"
    | "cached"
    | "manual"
    | "unavailable"
    | (string & {})
    | null;
  price_last_updated_at?: string | null;
  balance_last_synced_at?: string | null;
  last_synced_at?: string | null;
  /** Legacy passthrough — kept while older rows roll over to the new shape. */
  chain?: string | null;
  token_standard?: string | null;
  balance_cache?: string | null;
};

/** GET /api/app/wallet/assets `data` envelope */
export type WalletAssetsListPayload = {
  assets: WalletAssetItem[];
  last_synced_at: string | null;
  summary?: {
    total_usd: string;
    currency: string;
    price_status: "live" | "cached" | "partial" | "unavailable" | (string & {});
  };
};

/** POST /api/app/wallet/assets/refresh `data` envelope */
export type WalletAssetsRefreshPayload = WalletAssetsListPayload & {
  from_cache?: boolean;
};

export type WalletSummaryPayload = {
  total_usd: string;
  currency: string;
  price_status: "live" | "cached" | "partial" | "unavailable" | (string & {});
  last_updated_at: string | null;
};

/** GET /api/app/wallet/receive-addresses `data.addresses[]` */
export type WalletReceiveAddressRow = {
  network: string;
  asset_type: string;
  symbol: string;
  address: string;
  status: string;
};

export type WalletSendPreviewPayload = {
  preview_id: string;
  estimated_fee_amount: string;
  fee_symbol: string;
  total_amount: string | null;
  warnings: string[];
  expires_at: string;
  network?: string;
  asset_type?: string;
  symbol?: string;
  from_address?: string | null;
  to_address?: string | null;
  amount?: string | null;
  verification_required?: {
    passphrase?: boolean;
    two_factor?: boolean;
  };
};

export type WalletSendBroadcastTransactionRow = {
  id: number;
  network: string;
  asset_type?: string;
  symbol: string;
  amount: string;
  fee_amount: string | null;
  fee_symbol: string | null;
  total_amount: string | null;
  to_address: string;
  from_address: string | null;
  tx_hash: string | null;
  status: string;
  explorer_url?: string | null;
};

export type WalletSendConfirmPayload = {
  transaction: WalletSendBroadcastTransactionRow;
  wallet_transaction_id: number;
  tx_hash: string | null;
  status: string;
  network: string;
  explorer_url: string | null;
  duplicate?: boolean;
};

export type WalletOnChainTransactionRow = {
  id: number;
  transaction_type: string;
  network: string;
  asset_type: string;
  symbol: string;
  token_address: string | null;
  from_address: string | null;
  to_address: string;
  amount: string;
  fee_amount: string | null;
  fee_symbol: string | null;
  total_amount: string | null;
  tx_hash: string | null;
  status: string;
  failure_reason_code: string | null;
  failure_message: string | null;
  explorer_name: string | null;
  explorer_url: string | null;
  broadcasted_at: string | null;
  confirmed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
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

export type UserSettingsPreferencesBody = {
  theme?: UserSettings["theme"];
  timezone?: string;
  notifications?: UserSettingsNotifications;
  risk_preference?: UserSettings["risk_preference"];
  default_currency?: string;
};

export type AppSettingsSecurityOverview = {
  two_factor: {
    enabled: boolean;
    method: string | null;
    confirmed_at: string | null;
  };
  passphrase_set: boolean;
  email_verified: boolean;
};

export type ExchangeProviderId = "binance" | "coinbase" | "bybit";

export type ExchangeConnectionMode = "portfolio_only" | "trading";

export type ExchangeConnectionSummary = {
  id?: string;
  exchange: ExchangeProviderId | string;
  provider?: ExchangeProviderId | string;
  connection_id?: string | null;
  label?: string | null;
  status: string;
  connection_mode?: ExchangeConnectionMode | string | null;
  key_fingerprint?: string | null;
  key_display_suffix?: string | null;
  masked_api_key?: string | null;
  provider_account_uid?: string | null;
  binance_uid?: string | null;
  account_type?: string | null;
  permissions?: Record<string, unknown> | null;
  can_trade?: boolean;
  can_withdraw?: boolean;
  can_deposit?: boolean | null;
  is_valid?: boolean;
  last_verified_at?: string | null;
  last_synced_at?: string | null;
  last_error_code?: string | null;
  failure_reason_code?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type BinanceValidationPreview = {
  provider: "binance";
  label?: string | null;
  binance_uid?: string | null;
  account_type?: string | null;
  permissions?: string[];
  can_trade?: boolean;
  can_withdraw?: boolean;
  can_deposit?: boolean | null;
  valid?: boolean;
  warnings?: string[];
  message?: string | null;
};

export type ExchangePortfolioBalance = {
  asset: string;
  free: string;
  locked: string;
};

export type ExchangePortfolioResponse = {
  connection: ExchangeConnectionSummary;
  account: {
    binance_uid?: string | null;
    account_type?: string | null;
    permissions?: string[];
    can_trade?: boolean;
    can_withdraw?: boolean;
    can_deposit?: boolean | null;
  };
  balances: ExchangePortfolioBalance[];
  total_estimated_usd?: string | null;
  valuation_available?: boolean;
};

export type ExchangeConnectionsListData = {
  connections: ExchangeConnectionSummary[];
  exchanges: ExchangeConnectionSummary[];
};

/** GET /api/app/settings — envelope `data` */
export type AppSettingsOverviewData = {
  settings: UserSettings;
  profile: UserProfile;
  security: AppSettingsSecurityOverview;
  exchanges: ExchangeConnectionSummary[];
};

/** PATCH /api/app/settings — envelope `data` */
export type UserSettingsPatchResponse = {
  settings: UserSettings;
};

/** @deprecated alias */
export type UserSettingsPayload = AppSettingsOverviewData;

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

export type AgentCapabilities = {
  agents_enabled: boolean;
  trade_suggestions_enabled: boolean;
  executable_trade_preparation_enabled: boolean;
  trade_execution_enabled: boolean;
  binance_trading_enabled: boolean;
  requires_exchange_connection: boolean;
  requires_risk_confirmation: boolean;
  has_valid_binance_connection: boolean;
  has_trading_binance_connection: boolean;
  disclaimer: string;
};

export type UserAgentRecord = {
  id: string;
  name: string;
  slug?: string | null;
  primary_job: string;
  description_prompt: string;
  agent_type: string;
  can_suggest_trades: boolean;
  can_prepare_executable_trades: boolean;
  risk_profile: string;
  symbols: string[];
  timeframe?: string | null;
  strategy_preferences: string[];
  max_trade_size?: string | number | null;
  max_daily_trades?: number;
  status: string;
  exchange_connection_id?: number | null;
  safety_confirmations?: Record<string, boolean> | null;
  last_run_at?: string | null;
  total_analyses?: number;
  total_trade_suggestions?: number;
  created_at?: string;
  updated_at?: string;
  disclaimer?: string;
};

export type UserAgentCreateBody = {
  name: string;
  primary_job: string;
  description_prompt: string;
  agent_type: string;
  can_suggest_trades?: boolean;
  can_prepare_executable_trades?: boolean;
  symbols?: string[];
  timeframe?: string;
  risk_profile?: string;
  max_trade_size?: number;
  exchange_connection_id?: number | null;
  strategy_preferences?: string[];
  safety_confirmations?: Record<string, boolean>;
};

export type AgentRunRecord = {
  id: string;
  user_agent_id: string;
  run_type: string;
  status: string;
  started_at?: string | null;
  completed_at?: string | null;
  error_code?: string | null;
  output_snapshot?: Record<string, unknown>;
  created_at?: string;
};

export type AgentMarketAnalysisRecord = {
  id: string;
  symbol: string;
  timeframe?: string | null;
  explanation?: string | null;
  confidence_score?: number | null;
  calculated_indicators?: Record<string, unknown>;
  pattern_summary?: Record<string, unknown>;
  risk_summary?: Record<string, unknown>;
  created_at?: string;
};

export type CreateTradeSuggestionBody = {
  symbol: string;
  side?: "buy" | "sell" | "long" | "short" | "auto";
  timeframe?: string;
  risk_profile?: "conservative" | "balanced" | "aggressive";
  trade_type: "spot";
  notes?: string;
  accepted_risk_disclaimer: true;
};

export type CreateTradeSuggestionResponse = {
  suggestion: AgentTradeSuggestionRecord;
};

export type AgentTradeSuggestionRecord = {
  id: string;
  symbol: string;
  side: string;
  order_type: string;
  quantity?: string | number | null;
  quote_amount?: string | number | null;
  suggested_entry_price?: string | number | null;
  stop_loss_price?: string | number | null;
  take_profit_price?: string | number | null;
  risk_reward_ratio?: string | number | null;
  confidence_score?: string | number | null;
  status: string;
  reasoning?: string | null;
  estimated_max_loss?: number | null;
  invalidation_condition?: string | null;
  expires_at?: string | null;
  is_expired?: boolean;
  disclaimer?: string;
  created_at?: string;
};

export type AgentTradeExecutionRecord = {
  id: string;
  provider_order_id?: string | null;
  client_order_id?: string | null;
  symbol: string;
  side: string;
  status: string;
  error_code?: string | null;
  created_at?: string;
};

export type SubscriptionPlanLimits = {
  watchlists: number;
  tracked_assets: number;
  alerts: number;
  premium_market_data: boolean;
  priority_support: boolean;
};

export type SubscriptionPlanRow = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  monthly_price: number;
  yearly_price: number | null;
  currency: string;
  billing_interval_support: string[];
  features: string[];
  limits: SubscriptionPlanLimits;
  sort_order: number;
  price_minor?: number;
  billing_interval?: string;
};

export type SubscriptionPlansPayload = {
  plans: SubscriptionPlanRow[];
};

export type CurrentSubscription = {
  subscription_id: number | null;
  plan_id: number;
  plan_slug: string;
  plan_name: string;
  status: string;
  billing_interval: string | null;
  starts_at: string | null;
  renews_at: string | null;
  ends_at: string | null;
  limits: SubscriptionPlanLimits;
  features: string[];
};

export type BillingCheckoutBody = {
  plan_slug: string;
  billing_interval?: "monthly" | "yearly";
  pay_currency?: string;
};

export type BillingCheckoutResponse = {
  payment_id: number | null;
  order_id: string | null;
  payment_url: string | null;
  status: string;
  subscription_id?: number;
  plan_slug?: string;
  provider_status?: string | null;
  pay_currency?: string | null;
  expires_at?: string | null;
  fulfilled_at?: string | null;
  internal_reference?: string | null;
};

export type PaymentStatusResponse = BillingCheckoutResponse;
