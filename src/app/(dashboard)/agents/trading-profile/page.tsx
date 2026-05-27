"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/system/loading-state";
import { InlineAlert } from "@/components/system/inline-alert";
import { SubmitButton } from "@/components/system/submit-button";
import {
  useTradingProfilePreferencesMutation,
  useTradingProfileQuery,
} from "@/features/trading/use-trading-profile-api";

export default function TradingProfilePage() {
  const { data: profile, isLoading, isError } = useTradingProfileQuery();
  const mut = useTradingProfilePreferencesMutation();
  const [risk, setRisk] = useState("balanced");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.risk_preference) {
      setRisk(profile.risk_preference);
    }
  }, [profile?.risk_preference]);

  async function save() {
    setMessage(null);
    try {
      await mut.mutateAsync({ risk_preference: risk });
      setMessage("Preferences updated.");
    } catch {
      setMessage("Could not update preferences.");
    }
  }

  return (
    <>
      <PageHeader
        title="Trading Profile"
        description="Preferences used to personalize PA 3.0.0 market analysis."
      />
      <div className="mb-4 text-sm">
        <Link href="/agents/pa" className="font-medium text-primary hover:underline">
          ← PA analysis
        </Link>
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        Prosperofy uses your in-app interactions to personalize market analysis. You can manage
        preferences anytime. We do not store private keys, seed phrases, or wallet secrets.
      </p>

      {isLoading ? <LoadingState label="Loading profile…" /> : null}
      {isError ? <InlineAlert tone="error">Could not load trading profile.</InlineAlert> : null}

      {profile ? (
        <div className="max-w-lg space-y-4 rounded-lg border border-border bg-card p-6">
          <div>
            <p className="text-sm font-medium text-foreground">Risk preference</p>
            <select
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={risk}
              onChange={(e) => setRisk(e.target.value)}
            >
              <option value="conservative">Conservative</option>
              <option value="balanced">Balanced</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Preferred symbols: {(profile.preferred_symbols ?? []).join(", ") || "—"}</p>
            <p className="mt-1">
              Preferred timeframes: {(profile.preferred_timeframes ?? []).join(", ") || "—"}
            </p>
            <p className="mt-1">Saved signals: {profile.saved_signal_count ?? 0}</p>
            <p className="mt-1">Dismissed signals: {profile.dismissed_signal_count ?? 0}</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            <SubmitButton pending={mut.isPending}>Save preferences</SubmitButton>
          </form>
          {message ? <InlineAlert tone="info">{message}</InlineAlert> : null}
        </div>
      ) : null}
    </>
  );
}
