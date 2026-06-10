import type { CreateTradeSuggestionBody, UserAgentRecord } from "@/lib/api/types";

export function resolveAgentSymbol(agent: UserAgentRecord): string | null {
  const symbols = agent.symbols ?? [];
  for (const symbol of symbols) {
    if (typeof symbol === "string" && symbol.trim() !== "") {
      return symbol.trim().toUpperCase();
    }
  }
  return null;
}

export function buildTradeSuggestionBody(agent: UserAgentRecord): CreateTradeSuggestionBody | null {
  const symbol = resolveAgentSymbol(agent);
  if (!symbol) return null;

  const body: CreateTradeSuggestionBody = {
    symbol,
    side: "auto",
    timeframe: agent.timeframe ?? "1h",
    risk_profile: (agent.risk_profile as CreateTradeSuggestionBody["risk_profile"]) ?? "balanced",
    trade_type: "spot",
    accepted_risk_disclaimer: true,
  };

  const notes = agent.description_prompt?.trim();
  if (notes) {
    body.notes = notes;
  }

  return body;
}
