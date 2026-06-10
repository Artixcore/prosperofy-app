import type { AiActionType } from "@/lib/api/types";

export type AiActionButtonConfig = {
  label: string;
  actionType: AiActionType;
  context?: { wallet_type?: "save" | "invest" | "spend" };
};

export type AiActionCardConfig = {
  id: string;
  title: string;
  purpose: string;
  statusHint: string;
  insight: string;
  buttons: AiActionButtonConfig[];
};

export const AI_ACTION_CARDS: AiActionCardConfig[] = [
  {
    id: "savings-advisor",
    title: "AI Savings Advisor",
    purpose: "Find safer ways to grow your Save Wallet over time.",
    statusHint: "Save Wallet",
    insight: "Review your reserve and yield readiness.",
    buttons: [
      { label: "Analyze Save Wallet", actionType: "analyze_save_wallet", context: { wallet_type: "save" } },
      { label: "Suggest yield option", actionType: "suggest_yield_option", context: { wallet_type: "save" } },
      { label: "Explain risks", actionType: "explain_save_risks", context: { wallet_type: "save" } },
    ],
  },
  {
    id: "investment-agent",
    title: "AI Investment Agent",
    purpose: "Review your Invest Wallet and suggest allocation ideas.",
    statusHint: "Invest Wallet",
    insight: "Check portfolio balance and allocation ideas.",
    buttons: [
      { label: "Analyze portfolio", actionType: "analyze_portfolio" },
      { label: "Suggest allocation", actionType: "suggest_allocation", context: { wallet_type: "invest" } },
      { label: "Get rebalance idea", actionType: "suggest_rebalance" },
    ],
  },
  {
    id: "spending-assistant",
    title: "AI Spending Assistant",
    purpose: "Review Spend Wallet activity and suggest better spending habits.",
    statusHint: "Spend Wallet",
    insight: "Track habits and card top-up ideas.",
    buttons: [
      { label: "Analyze spending", actionType: "analyze_spending", context: { wallet_type: "spend" } },
      { label: "Suggest budget", actionType: "suggest_budget", context: { wallet_type: "spend" } },
      { label: "Prepare card top-up idea", actionType: "prepare_card_topup_idea", context: { wallet_type: "spend" } },
    ],
  },
  {
    id: "risk-monitor",
    title: "AI Risk Monitor",
    purpose: "Detect high-risk exposure and explain what to watch.",
    statusHint: "Risk overview",
    insight: "Scan exposure across your wallets.",
    buttons: [
      { label: "Scan risk", actionType: "scan_risk" },
      { label: "Explain exposure", actionType: "explain_exposure" },
      { label: "Suggest safer move", actionType: "suggest_safer_move" },
    ],
  },
  {
    id: "rewards-optimizer",
    title: "AI Rewards Optimizer",
    purpose: "Help you understand membership, cashback, and referral opportunities.",
    statusHint: "Rewards & membership",
    insight: "See what your plan unlocks today.",
    buttons: [
      { label: "Analyze rewards", actionType: "analyze_rewards" },
      { label: "Suggest next step", actionType: "suggest_rewards_next_step" },
      { label: "View membership benefits", actionType: "view_membership_benefits" },
    ],
  },
];
