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
      challenge: "/api/app/wallet/challenge",
      connect: "/api/app/wallet/connect",
      create: "/api/app/wallet/create",
      assets: "/api/app/wallet/assets",
      activity: "/api/app/wallet/activity",
      disconnect: (id: string) => `/api/app/wallet/connected/${id}` as const,
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
      signalTrack: (id: string | number) =>
        `/api/app/agents/signals/${encodeURIComponent(String(id))}/track` as const,
      signalOutcome: (id: string | number) =>
        `/api/app/agents/signals/${encodeURIComponent(String(id))}/outcome` as const,
      rewards: "/api/app/agents/rewards",
      rewardClaim: (id: string | number) =>
        `/api/app/agents/rewards/${encodeURIComponent(String(id))}/claim` as const,
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
