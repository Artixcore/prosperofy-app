import { z } from "zod";

export const marketSignalSchema = z.object({
  id: z.number(),
  agent_key: z.string(),
  market_type: z.string(),
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
});

export type MarketSignal = z.infer<typeof marketSignalSchema>;
