import { z } from "zod";

export const aiAgentSchema = z.object({
  id: z.number(),
  key: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string().nullable().optional(),
  enabled: z.boolean(),
  supported_markets: z.array(z.string()).nullable().optional(),
  supported_timeframes: z.array(z.string()).nullable().optional(),
});

export type AiAgent = z.infer<typeof aiAgentSchema>;

export const agentsCatalogSchema = z.object({
  agents: z.array(aiAgentSchema),
});

export const laravelPaginatorSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    current_page: z.number(),
    data: z.array(item),
    last_page: z.number(),
    per_page: z.number(),
    total: z.number(),
  });

export const MARKET_OPTIONS = ["crypto", "forex", "stock", "futures", "commodity", "index", "other"] as const;

export const AGENT_KEYS = [
  "market_research",
  "crypto_research",
  "forex_research",
  "stock_research",
  "country_stock",
  "futures_research",
  "assets_research",
  "sentiment",
  "news",
  "trends",
  "historical",
  "signal",
  "risk",
  "portfolio_insight",
] as const;

export type AgentKey = (typeof AGENT_KEYS)[number];

export const aiAgentRunRowSchema = z.object({
  id: z.number(),
  agent_key: z.string(),
  status: z.string(),
  created_at: z.string(),
  market: z.string().optional(),
  timeframe: z.string().nullable().optional(),
});

export type AiAgentRunRow = z.infer<typeof aiAgentRunRowSchema>;
