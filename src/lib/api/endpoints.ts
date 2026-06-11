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
    settingsExchangeConnections: "/api/app/settings/exchange-connections",
    settingsBinanceValidate: "/api/app/settings/exchange-connections/binance/validate",
    settingsBinanceStore: "/api/app/settings/exchange-connections/binance",
    settingsExchangeConnection: (id: string) =>
      `/api/app/settings/exchange-connections/${encodeURIComponent(id)}` as const,
    settingsExchangeConnectionRevalidate: (id: string) =>
      `/api/app/settings/exchange-connections/${encodeURIComponent(id)}/revalidate` as const,
    settingsExchangePortfolio: (id: string) =>
      `/api/app/settings/exchange-connections/${encodeURIComponent(id)}/portfolio` as const,
    settingsExchangeBalances: (id: string) =>
      `/api/app/settings/exchange-connections/${encodeURIComponent(id)}/balances` as const,
    settingsExchangePermissions: (id: string) =>
      `/api/app/settings/exchange-connections/${encodeURIComponent(id)}/permissions` as const,
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
    },
    agents: {
      capabilities: "/api/app/agents/capabilities",
      list: "/api/app/agents",
      create: "/api/app/agents",
      show: (id: string) => `/api/app/agents/${encodeURIComponent(id)}` as const,
      update: (id: string) => `/api/app/agents/${encodeURIComponent(id)}` as const,
      delete: (id: string) => `/api/app/agents/${encodeURIComponent(id)}` as const,
      disable: (id: string) => `/api/app/agents/${encodeURIComponent(id)}/disable` as const,
      run: (id: string) => `/api/app/agents/${encodeURIComponent(id)}/run` as const,
      runs: (id: string) => `/api/app/agents/${encodeURIComponent(id)}/runs` as const,
      analyses: (id: string) => `/api/app/agents/${encodeURIComponent(id)}/analyses` as const,
      tradeSuggestions: (id: string) =>
        `/api/app/agents/${encodeURIComponent(id)}/trade-suggestions` as const,
      tradeSuggestionExplain: (agentId: string, suggestionId: string) =>
        `/api/app/agents/${encodeURIComponent(agentId)}/trade-suggestions/${encodeURIComponent(suggestionId)}/explain` as const,
      tradeSuggestionSave: (agentId: string, suggestionId: string) =>
        `/api/app/agents/${encodeURIComponent(agentId)}/trade-suggestions/${encodeURIComponent(suggestionId)}/save` as const,
      tradeSuggestionCancel: (agentId: string, suggestionId: string) =>
        `/api/app/agents/${encodeURIComponent(agentId)}/trade-suggestions/${encodeURIComponent(suggestionId)}/cancel` as const,
      tradeSuggestionExecute: (agentId: string, suggestionId: string) =>
        `/api/app/agents/${encodeURIComponent(agentId)}/trade-suggestions/${encodeURIComponent(suggestionId)}/execute` as const,
      tradeExecutions: (id: string) =>
        `/api/app/agents/${encodeURIComponent(id)}/trade-executions` as const,
    },
    ai: {
      createAction: "/api/app/ai/actions",
      recommendations: "/api/app/ai/recommendations",
      save: (id: string) => `/api/app/ai/recommendations/${encodeURIComponent(id)}/save` as const,
      dismiss: (id: string) =>
        `/api/app/ai/recommendations/${encodeURIComponent(id)}/dismiss` as const,
    },
    wallet: {
      controlCenter: "/api/app/wallet/control-center",
      overview: "/api/app/wallet",
      summary: "/api/app/wallet/summary",
      create: "/api/app/wallet/create",
      assets: "/api/app/wallet/assets",
      assetsRefresh: "/api/app/wallet/assets/refresh",
      balanceRefresh: "/api/app/wallet/balance/refresh",
      pricesRefresh: "/api/app/wallet/prices/refresh",
      activity: "/api/app/wallet/activity",
      receiveAddresses: "/api/app/wallet/receive-addresses",
      sendPreview: "/api/app/wallet/send/preview",
      sendConfirm: "/api/app/wallet/send/confirm",
      transactions: "/api/app/wallet/transactions",
      transactionsChart: "/api/app/wallet/transactions/chart",
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
    rewards: {
      overview: "/api/app/rewards/overview",
      referrals: "/api/app/rewards/referrals",
      ledger: "/api/app/rewards/ledger",
      monthlySummary: "/api/app/rewards/monthly-summary",
      regenerateCode: "/api/app/rewards/referral-code/regenerate",
      payoutProfile: "/api/app/rewards/payout-profile",
      payoutHistory: "/api/app/rewards/payout-history",
    },
    yield: {
      overview: "/api/app/yield/overview",
      pools: "/api/app/yield/pools",
      pool: (id: string) => `/api/app/yield/pools/${encodeURIComponent(id)}` as const,
      allocations: "/api/app/yield/allocations",
      allocation: (id: string) => `/api/app/yield/allocations/${encodeURIComponent(id)}` as const,
      cancelAllocation: (id: string) =>
        `/api/app/yield/allocations/${encodeURIComponent(id)}/cancel` as const,
      toggleAutoCompound: (id: string) =>
        `/api/app/yield/allocations/${encodeURIComponent(id)}/toggle-auto-compound` as const,
      earnings: "/api/app/yield/earnings",
    },
    card: {
      overview: "/api/app/card/overview",
      orders: "/api/app/card/orders",
      currentOrder: "/api/app/card/orders/current",
      order: (id: string) => `/api/app/card/orders/${encodeURIComponent(id)}` as const,
      refreshOrder: (id: string) =>
        `/api/app/card/orders/${encodeURIComponent(id)}/refresh-status` as const,
      activity: "/api/app/card/activity",
    },
    billing: {
      plans: "/api/app/billing/plans",
      subscription: "/api/app/billing/subscription",
      checkout: "/api/app/billing/checkout",
      cancel: "/api/app/billing/cancel",
      payments: "/api/app/billing/payments",
      paymentStatus: (id: string | number) =>
        `/api/app/billing/payments/${encodeURIComponent(String(id))}/status` as const,
    },
  },
} as const;
