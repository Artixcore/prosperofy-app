export function agentsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AGENTS_ENABLED !== "false";
}

export const AGENT_DISCLAIMER =
  "This is not financial advice. Trading involves risk and you can lose money.";
