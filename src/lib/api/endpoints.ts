/** Laravel `prosperofy-laravel-core` API paths only — no internal services. */

export const API = {
  auth: {
    csrfCookie: "/sanctum/csrf-cookie",
    register: "/api/auth/register",
    login: "/api/auth/login",
    logout: "/api/auth/logout",
  },
  app: {
    dashboard: "/api/app/dashboard",
    profile: "/api/app/profile",
    settings: "/api/app/settings",
    notifications: {
      list: "/api/app/notifications",
      readAll: "/api/app/notifications/read-all",
      read: (id: string) => `/api/app/notifications/${id}/read` as const,
    },
    activity: {
      list: "/api/app/activity",
    },
    strategies: {
      list: "/api/app/strategies",
      create: "/api/app/strategies",
      show: (id: string) => `/api/app/strategies/${id}` as const,
      update: (id: string) => `/api/app/strategies/${id}` as const,
      evaluations: (id: string) => `/api/app/strategies/${id}/evaluations` as const,
    },
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
    wallet: {
      overview: "/api/app/wallet",
      challenge: "/api/app/wallet/challenge",
      connect: "/api/app/wallet/connect",
      create: "/api/app/wallet/create",
      assets: "/api/app/wallet/assets",
      activity: "/api/app/wallet/activity",
      disconnect: (id: string) => `/api/app/wallet/connected/${id}` as const,
    },
    ai: {
      analysisMarket: "/api/app/analysis/market",
      strategyGenerate: "/api/app/strategy/generate",
      riskScore: "/api/app/risk/score",
      quantBacktestTrend: "/api/app/quant/backtest/trend",
      strategyEvaluateDispatch: "/api/app/strategy/evaluate/dispatch",
      orchestrationJob: (jobId: string) =>
        `/api/app/orchestration/jobs/${jobId}` as const,
    },
  },
} as const;
