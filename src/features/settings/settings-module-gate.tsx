"use client";

import type { ReactNode } from "react";
import { ErrorState } from "@/components/system/error-state";
import { LoadingState } from "@/components/system/loading-state";
import { useSettingsQuery } from "@/features/app/use-settings";

export function SettingsModuleGate({ children }: { children: (data: NonNullable<ReturnType<typeof useSettingsQuery>["data"]>) => ReactNode }) {
  const settings = useSettingsQuery();

  if (settings.isPending && settings.fetchStatus === "fetching") {
    return <LoadingState label="Loading settings…" />;
  }

  if (settings.isError || !settings.data) {
    return (
      <ErrorState
        error={settings.error}
        title="Settings could not be loaded. Please try again shortly."
        onRetry={() => void settings.refetch()}
      />
    );
  }

  return <>{children(settings.data)}</>;
}
