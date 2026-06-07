import { formatActivityNetwork } from "@/lib/formatters";

export type ActivityIconKey =
  | "wallet"
  | "credit-card"
  | "bot"
  | "receipt"
  | "link"
  | "activity";

export type ActivityLabelEntry = {
  title: string;
  description: string;
  icon?: ActivityIconKey;
};

export const ACTIVITY_LABELS: Record<string, ActivityLabelEntry> = {
  "wallet.assets.refresh": {
    title: "Wallet balance refreshed",
    description: "Your wallet assets were updated.",
    icon: "wallet",
  },
  "wallet.transaction.sent": {
    title: "Transaction sent",
    description: "A wallet transaction was submitted.",
    icon: "wallet",
  },
  "wallet.transaction.confirmed": {
    title: "Transaction confirmed",
    description: "A wallet transaction was confirmed on-chain.",
    icon: "wallet",
  },
  "billing.subscription.created": {
    title: "Subscription started",
    description: "Your subscription was created.",
    icon: "receipt",
  },
  "billing.payment.completed": {
    title: "Payment completed",
    description: "Your payment was confirmed.",
    icon: "receipt",
  },
  "exchange.connection.created": {
    title: "Exchange connected",
    description: "Your exchange account was added securely.",
    icon: "link",
  },
  "agent.created": {
    title: "Agent created",
    description: "A new agent was added to your workspace.",
    icon: "bot",
  },
};

export function humanizeEventKey(key: string): string {
  const trimmed = key.trim();
  if (!trimmed) return "Activity";
  return trimmed
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export type ActivityDisplayInput = {
  action?: string | null;
  kind?: string | null;
  chain?: string | null;
  created_at?: string | null;
};

export type ActivityDisplay = {
  title: string;
  description: string;
  subtitle: string;
  icon: ActivityIconKey;
};

function resolveEventKey(input: ActivityDisplayInput): string {
  const action = (input.action ?? "").trim();
  if (action) return action;
  const kind = (input.kind ?? "").trim();
  if (kind) return kind;
  return "activity";
}

export function resolveActivityDisplay(input: ActivityDisplayInput): ActivityDisplay {
  const eventKey = resolveEventKey(input);
  const mapped = ACTIVITY_LABELS[eventKey];
  const title = mapped?.title ?? humanizeEventKey(eventKey);
  const description = mapped?.description ?? "";
  const icon = mapped?.icon ?? "activity";

  const network = formatActivityNetwork(input.chain);
  const timeLabel = formatActivityTime(input.created_at);
  const contextLabel = network ?? "Wallet activity";
  const subtitle = timeLabel ? `${contextLabel} • ${timeLabel}` : contextLabel;

  return { title, description, subtitle, icon };
}

export function formatActivityTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
