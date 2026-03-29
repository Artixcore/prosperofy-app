/** Laravel `prosperofy-laravel-core` API paths only — no internal services. */

export const API = {
  auth: {
    register: "/api/auth/register",
    login: "/api/auth/login",
    logout: "/api/auth/logout",
  },
  app: {
    wallets: {
      nonce: "/api/app/wallets/nonce",
      connectPhantom: "/api/app/wallets/connect/phantom",
      connectMetaMask: "/api/app/wallets/connect/metamask",
      list: "/api/app/wallets",
      show: (id: string) => `/api/app/wallets/${id}` as const,
      balanceRefresh: (id: string) =>
        `/api/app/wallets/${id}/balance/refresh` as const,
      txPrepare: (id: string) =>
        `/api/app/wallets/${id}/transactions/prepare` as const,
      txSimulate: (id: string) =>
        `/api/app/wallets/${id}/transactions/simulate` as const,
      txBroadcast: (id: string) =>
        `/api/app/wallets/${id}/transactions/broadcast` as const,
    },
    v1: {
      analysisMarket: "/api/app/v1/analysis/market",
      strategyGenerate: "/api/app/v1/strategy/generate",
      riskScore: "/api/app/v1/risk/score",
      quantBacktestTrend: "/api/app/v1/quant/backtest/trend",
      strategyEvaluateDispatch: "/api/app/v1/strategy/evaluate/dispatch",
      orchestrationJob: (jobId: string) =>
        `/api/app/v1/orchestration/jobs/${jobId}` as const,
    },
  },
} as const;
