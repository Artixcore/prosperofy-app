import { z } from "zod";

export const marketSignalSchema = z.object({
  id: z.number(),
  agent_key: z.string(),
  market_type: z.string(),
  asset_class: z.string().nullable().optional(),
  market_data_provider: z.string().nullable().optional(),
  data_freshness: z.string().nullable().optional(),
  symbol: z.string(),
  direction: z.string(),
  confidence_score: z.number(),
  risk_score: z.number(),
  timeframe: z.string(),
  status: z.string(),
  reasoning: z.string().optional(),
  disclaimer: z.string().nullable().optional(),
  generated_at: z.string().nullable().optional(),
  expires_at: z.string().nullable().optional(),
  source_data: z.record(z.string(), z.unknown()).nullable().optional(),
  source_snapshot: z.record(z.string(), z.unknown()).nullable().optional(),
  input_snapshot: z.record(z.string(), z.unknown()).nullable().optional(),
  market_snapshot: z.record(z.string(), z.unknown()).nullable().optional(),
  news_impact_summary: z.string().nullable().optional(),
});

export type MarketSignal = z.infer<typeof marketSignalSchema>;
