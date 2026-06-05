/** Laravel crypto-market agent API payloads (loose shapes). */

export type CryptoMarketInterval =
  | "1m"
  | "3m"
  | "5m"
  | "15m"
  | "30m"
  | "1h"
  | "2h"
  | "4h"
  | "6h"
  | "8h"
  | "12h"
  | "1d"
  | "3d"
  | "1w"
  | "1M";

export type CryptoMarketAnalyzeRequest = {
  symbols: string[];
  interval?: CryptoMarketInterval;
  lookback?: number;
  include_ai_summary?: boolean;
  include_orderbook?: boolean;
};

export type CryptoMarketHistoryRequest = {
  symbol: string;
  interval?: CryptoMarketInterval;
  lookback?: number;
  include_ai_summary?: boolean;
};

export type CryptoMarketSentimentRequest = {
  symbols: string[];
  include_news?: boolean;
  include_market_context?: boolean;
  include_ai_summary?: boolean;
};

export type CryptoMarketWhaleActivityRequest = {
  symbols: string[];
  interval?: CryptoMarketInterval;
  lookback?: number;
  include_orderbook?: boolean;
};

export type CryptoMarketManipulationRiskRequest = {
  symbols: string[];
  interval?: CryptoMarketInterval;
  lookback?: number;
  include_orderbook?: boolean;
};

export type CryptoMarketFullReportRequest = {
  symbols: string[];
  interval?: CryptoMarketInterval;
  lookback?: number;
  include_orderbook?: boolean;
  include_ai_summary?: boolean;
};

export type CryptoMarketSymbolResult = {
  symbol: string;
  available_on_binance?: boolean;
  success?: boolean;
  error?: string;
  price_summary?: Record<string, unknown>;
  volume_summary?: Record<string, unknown>;
  trend_direction?: string;
  volatility_level?: string;
  abnormal_activity?: boolean;
  confidence_score?: number;
  risk_level?: string;
  deterministic_metrics?: Record<string, unknown>;
};

export type CryptoMarketAnalyzeResponse = {
  results: CryptoMarketSymbolResult[];
  ai_summary?: string | null;
  disclaimer: string;
  warnings?: string[];
};

export type CryptoMarketHistoryResponse = {
  symbol: string;
  available_on_binance: boolean;
  ohlcv_summary?: Record<string, unknown>;
  major_drawdowns?: unknown[];
  major_pump_like_moves?: unknown[];
  major_dump_like_moves?: unknown[];
  volatility_changes?: Record<string, unknown>;
  volume_anomalies?: Record<string, unknown>;
  trend_changes?: Record<string, unknown>;
  ai_summary?: string | null;
  disclaimer: string;
  warnings?: string[];
};

export type CryptoMarketSentimentResponse = {
  overall_sentiment: string;
  per_symbol: Array<Record<string, unknown>>;
  confidence_level: string;
  drivers: string[];
  warnings: string[];
  data_limitations: string[];
  ai_explanation?: string | null;
  disclaimer: string;
};

export type CryptoMarketWhaleActivityResponse = {
  per_symbol: Array<Record<string, unknown>>;
  limitations: string[];
  disclaimer: string;
};

export type CryptoMarketManipulationRiskResponse = {
  per_symbol: Array<Record<string, unknown>>;
  disclaimer: string;
  warnings?: string[];
};

export type CryptoMarketFullReportResponse = {
  market_analysis: CryptoMarketAnalyzeResponse;
  token_history_summary: unknown[];
  sentiment_analysis: CryptoMarketSentimentResponse;
  whale_activity_analysis: CryptoMarketWhaleActivityResponse;
  manipulation_risk_analysis: CryptoMarketManipulationRiskResponse;
  final_ai_report?: string | null;
  limitations: string[];
  warnings?: string[];
  disclaimer: string;
};
