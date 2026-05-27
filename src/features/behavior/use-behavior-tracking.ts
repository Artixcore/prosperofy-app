"use client";

import { useCallback, useRef } from "react";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/auth/session-context";

export type BehaviorEventType =
  | "searched_symbol"
  | "viewed_symbol"
  | "selected_timeframe"
  | "added_watchlist"
  | "removed_watchlist"
  | "ran_analysis"
  | "viewed_market_dashboard"
  | "selected_symbol";

type RecordEventInput = {
  event_type: BehaviorEventType;
  symbol?: string;
  asset_class?: string;
  timeframe?: string;
  metadata?: Record<string, unknown>;
};

export function useBehaviorTracking() {
  const { token } = useAuth();
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const recordEvent = useCallback(
    (input: RecordEventInput, debounceMs = 0) => {
      if (!token) return;

      const key = `${input.event_type}:${input.symbol ?? ""}:${input.timeframe ?? ""}`;
      const existing = timers.current.get(key);
      if (existing) clearTimeout(existing);

      const fire = () => {
        void laravelFetch<Record<string, never>>(API.app.behavior.events, {
          method: "POST",
          body: input,
          token,
        }).catch(() => {
          /* non-critical tracking */
        });
      };

      if (debounceMs > 0) {
        timers.current.set(
          key,
          setTimeout(() => {
            timers.current.delete(key);
            fire();
          }, debounceMs),
        );
      } else {
        fire();
      }
    },
    [token],
  );

  return { recordEvent };
}
