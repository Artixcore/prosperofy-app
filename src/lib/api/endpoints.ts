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
    settingsProfile: "/api/app/settings/profile",
    settingsPassword: "/api/app/settings/password",
    settingsPassphrase: "/api/app/settings/passphrase",
    settingsPassphraseVerify: "/api/app/settings/passphrase/verify",
    settingsTwoFactor: "/api/app/settings/2fa",
    settingsTwoFactorSetup: "/api/app/settings/2fa/setup",
    settingsTwoFactorConfirm: "/api/app/settings/2fa/confirm",
    settingsTwoFactorDisable: "/api/app/settings/2fa/disable",
    settingsExchanges: "/api/app/settings/exchanges",
    settingsExchangeTest: (id: string) =>
      `/api/app/settings/exchanges/${encodeURIComponent(id)}/test` as const,
    settingsExchange: (id: string) =>
      `/api/app/settings/exchanges/${encodeURIComponent(id)}` as const,
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
      summary: "/api/app/wallet/summary",
      challenge: "/api/app/wallet/challenge",
      connect: "/api/app/wallet/connect",
      create: "/api/app/wallet/create",
      assets: "/api/app/wallet/assets",
      assetsRefresh: "/api/app/wallet/assets/refresh",
      pricesRefresh: "/api/app/wallet/prices/refresh",
      activity: "/api/app/wallet/activity",
      disconnect: (id: string) => `/api/app/wallet/connected/${id}` as const,
      receiveAddresses: "/api/app/wallet/receive-addresses",
      sendPreview: "/api/app/wallet/send/preview",
      sendConfirm: "/api/app/wallet/send/confirm",
      transactions: "/api/app/wallet/transactions",
      transactionsSync: "/api/app/wallet/transactions/sync",
      transaction: (id: string | number) =>
        `/api/app/wallet/transactions/${encodeURIComponent(String(id))}` as const,
      transactionCancel: (id: string | number) =>
        `/api/app/wallet/transactions/${encodeURIComponent(String(id))}/cancel` as const,
    },
    news: {
      latest: "/api/app/news/latest",
      market: "/api/app/news/market",
      crypto: "/api/app/news/crypto",
      search: "/api/app/news/search",
    },
    pa: {
      version: "/api/app/pa/version",
      analyze: "/api/app/pa/analyze",
      scan: "/api/app/pa/scan",
      history: "/api/app/pa/history",
      historyDetail: (id: string | number) =>
        `/api/app/pa/history/${encodeURIComponent(String(id))}` as const,
    },
    behavior: {
      events: "/api/app/behavior/events",
    },
    tradingProfile: {
      show: "/api/app/trading-profile",
      preferences: "/api/app/trading-profile/preferences",
    },
    agents: {
      list: "/api/app/agents",
      dashboard: "/api/app/agents/dashboard",
      run: "/api/app/agents/run",
      runs: "/api/app/agents/runs",
      runDetail: (id: string | number) =>
        `/api/app/agents/runs/${encodeURIComponent(String(id))}` as const,
      signalsGenerate: "/api/app/agents/signals/generate",
      signals: "/api/app/agents/signals",
      signalDetail: (id: string | number) =>
        `/api/app/agents/signals/${encodeURIComponent(String(id))}` as const,
      signalInteraction: (id: string | number) =>
        `/api/app/agents/signals/${encodeURIComponent(String(id))}/interactions` as const,
      signalTrack: (id: string | number) =>
        `/api/app/agents/signals/${encodeURIComponent(String(id))}/track` as const,
      signalOutcome: (id: string | number) =>
        `/api/app/agents/signals/${encodeURIComponent(String(id))}/outcome` as const,
      rewards: "/api/app/agents/rewards",
      rewardClaim: (id: string | number) =>
        `/api/app/agents/rewards/${encodeURIComponent(String(id))}/claim` as const,
    },
    market: {
      quote: "/api/app/market/quote",
      quotes: "/api/app/market/quotes",
      ohlc: "/api/app/market/ohlc",
      candles: "/api/app/market/candles",
      ticks: "/api/app/market/ticks",
      symbols: "/api/app/market/symbols",
      insights: "/api/app/market/insights",
      status: "/api/app/market/status",
      orderbook: "/api/app/market/orderbook",
      trades: "/api/app/market/trades",
      trending: "/api/app/market/trending",
      global: "/api/app/market/global",
      dashboard: "/api/app/market/dashboard",
      stream: "/api/app/market/stream",
      wsSubscribe: "/api/app/market/ws/subscribe",
      wsUnsubscribe: "/api/app/market/ws/unsubscribe",
    },
    watchlists: {
      list: "/api/app/watchlists",
      create: "/api/app/watchlists",
      addItem: (id: string | number) =>
        `/api/app/watchlists/${encodeURIComponent(String(id))}/items` as const,
      removeItem: (watchlistId: string | number, itemId: string | number) =>
        `/api/app/watchlists/${encodeURIComponent(String(watchlistId))}/items/${encodeURIComponent(String(itemId))}` as const,
    },
    portfolio: {
      overview: "/api/app/portfolio/overview",
      history: "/api/app/portfolio/history",
      snapshots: "/api/app/portfolio/snapshots",
    },
    ai: {
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
