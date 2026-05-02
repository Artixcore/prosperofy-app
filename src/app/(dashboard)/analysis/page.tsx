import { redirect } from "next/navigation";

/** Preserves legacy `/analysis` deep links — product UI lives under `/agents`. */
export default function AnalysisLegacyRedirectPage() {
  redirect("/agents/market-research");
}
