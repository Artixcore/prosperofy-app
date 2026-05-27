"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { AgentsDisclaimerBanner } from "@/components/agents/disclaimer";
import { PaAnalysisForm } from "@/components/pa/pa-analysis-form";
import { PaAnalysisResults } from "@/components/pa/pa-analysis-results";
import type { PAAnalysisResponse } from "@/types/pa";

export default function PaAnalysisPage() {
  const [result, setResult] = useState<PAAnalysisResponse | null>(null);

  return (
    <>
      <PageHeader
        title="PA 3.0.0 Market Intelligence Engine"
        description="AI-powered quantitative market analysis, regime detection, strategy scoring, and risk-aware trade suggestions."
      />
      <div className="space-y-6">
        <AgentsDisclaimerBanner />
        <p className="text-sm text-muted-foreground">
          Analysis runs through{" "}
          <span className="font-medium text-foreground">Prosperofy backend</span> only — your browser
          never calls internal AI or market data providers directly.
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/agents" className="font-medium text-primary hover:underline">
            ← Agents overview
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link href="/agents/signals" className="font-medium text-primary hover:underline">
            Signal history
          </Link>
        </div>

        <PaAnalysisForm
          onResult={(data) => {
            setResult(data);
          }}
        />

        {result ? <PaAnalysisResults data={result} /> : null}
      </div>
    </>
  );
}
