import { z } from "zod";

export const rewardsReferralSchema = z.object({
  code: z.string(),
  url: z.string(),
});

export const rewardsSummarySchema = z.object({
  total_invited: z.number(),
  active_members: z.number(),
  estimated_monthly_rewards: z.string(),
  pending_rewards: z.string(),
  approved_rewards: z.string(),
  paid_rewards: z.string(),
  currency: z.string(),
});

export const rewardsPlanRateSchema = z.object({
  label: z.string(),
  rate_min: z.string(),
  rate_max: z.string(),
  note: z.string(),
});

export const rewardLedgerItemSchema = z.object({
  date: z.string().nullable(),
  source_label: z.string(),
  type: z.string(),
  amount: z.string(),
  currency: z.string(),
  status: z.string(),
});

export const rewardsOverviewSchema = z.object({
  referral: rewardsReferralSchema,
  summary: rewardsSummarySchema,
  current_plan_reward_rate: rewardsPlanRateSchema,
  recent_rewards: z.array(rewardLedgerItemSchema),
});

export const referralMemberSchema = z.object({
  display_name: z.string(),
  initials: z.string(),
  joined_at: z.string().nullable(),
  status: z.string(),
  plan_label: z.string(),
  estimated_monthly_reward: z.string(),
  last_reward_at: z.string().nullable(),
  last_reward_amount: z.string().nullable(),
});

export const rewardMonthlySummaryItemSchema = z.object({
  month: z.string(),
  estimated: z.string(),
  approved: z.string(),
  paid: z.string(),
});

export const paginationSchema = z.object({
  current_page: z.number(),
  per_page: z.number(),
  total: z.number(),
  last_page: z.number(),
});

export type RewardsOverview = z.infer<typeof rewardsOverviewSchema>;
export type ReferralMember = z.infer<typeof referralMemberSchema>;
export type RewardLedgerItem = z.infer<typeof rewardLedgerItemSchema>;
export type RewardMonthlySummaryItem = z.infer<typeof rewardMonthlySummaryItemSchema>;
