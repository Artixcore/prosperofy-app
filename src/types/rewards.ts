import { z } from "zod";

export const wflRewardSchema = z.object({
  id: z.number(),
  reward_type: z.string(),
  status: z.string(),
  wfl_amount: z.string(),
  gain_amount: z.string().nullable().optional(),
  claim_tx_hash: z.string().nullable().optional(),
  created_at: z.string(),
});

export type WflReward = z.infer<typeof wflRewardSchema>;
