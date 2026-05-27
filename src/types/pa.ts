export type PATimeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

export type PAAnalysisRequest = {
  symbol: string;
  asset_class?: "crypto";
  timeframe: PATimeframe;
  lookback?: number;
  include_news?: boolean;
  include_emotion?: boolean;
};

export type PARegime = {
  name: string;
  confidence?: number;
  reason?: string;
};

export type PASelectedStrategy = {
  name: string;
  score?: number;
  reason?: string;
};

export type PASignal = {
  action: string;
  confidence?: number;
  risk_level?: string;
  time_horizon?: string;
};

export type PATradePlan = {
  entry_zone?: {
    min?: string;
    max?: string;
  };
  stop_loss?: string | null;
  take_profit?: Array<{
    label: string;
    price: string;
  }>;
  risk_reward_ratio?: string | null;
  invalidation?: string | null;
};

export type PAAnalysisMeta = {
  run_id?: number;
  analysis_id?: number;
  signal_id?: number;
};

export type PAAnalysisResponse = {
  model: string;
  engine_version: string;
  symbol: string;
  asset_class: string;
  timeframe: string;
  timestamp?: string;
  price?: string | null;
  regime?: PARegime;
  selected_strategy?: PASelectedStrategy;
  signal?: PASignal;
  trade_plan?: PATradePlan;
  scores?: Record<string, number | null>;
  indicators?: Record<string, unknown>;
  news_context?: Record<string, unknown>;
  reasoning?: string | null;
  warnings?: string[];
  data_freshness?: string;
  user_personalization?: {
    used?: boolean;
    risk_profile?: string;
    notes?: string[];
  };
  _meta?: PAAnalysisMeta;
};

export type PAHistoryItem = {
  id: number;
  symbol: string;
  timeframe: string;
  signal_action?: string | null;
  confidence?: number | null;
  risk_level?: string | null;
  market_regime?: string | null;
  created_at?: string;
  generated_at?: string;
};

export type PAHistoryListResponse = {
  analyses: PAHistoryItem[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export const PA_SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "SOLUSDT",
  "BNBUSDT",
  "XRPUSDT",
  "ADAUSDT",
  "DOGEUSDT",
] as const;

export const PA_TIMEFRAMES: PATimeframe[] = ["1m", "5m", "15m", "1h", "4h", "1d"];
